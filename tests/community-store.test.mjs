import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source =
  readFileSync(new URL('../src/lib/store.tsx', import.meta.url), 'utf8') +
  '\nexport { AccountStore };';
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function mount(api, actor = 'account-a') {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const cleanups = [];
  let writes = 0;
  const react = {
    createContext: () => ({ Provider: 'Provider' }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (next) => {
          writes++;
          slots[index] = typeof next === 'function' ? next(slots[index]) : next;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      return (slots[index] ??= { current: initial });
    },
    useCallback(fn, deps) {
      const index = cursor++;
      const prev = slots[index];
      if (!prev || deps.some((value, i) => value !== prev.deps[i])) slots[index] = { fn, deps };
      return slots[index].fn;
    },
    useEffect(fn, deps) {
      const index = cursor++;
      const prev = slots[index];
      if (!prev || deps.some((value, i) => value !== prev[i])) {
        slots[index] = deps;
        effects.push(fn);
      }
    },
  };
  class ApiError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  const exports = {};
  const dependencies = {
    react,
    './api': { api, ApiError, errorMessage: (e) => e.message },
    './auth': {},
  };
  new Function('require', 'exports', code)((name) => dependencies[name] ?? require(name), exports);
  return {
    render() {
      cursor = 0;
      const tree = exports.AccountStore({ actor, children: null });
      for (const effect of effects.splice(0)) cleanups.push(effect());
      return tree.props.value;
    },
    unmount() {
      for (const cleanup of cleanups) cleanup?.();
    },
    writes: () => writes,
  };
}
test('favorites start empty and only change after the server confirms a write', async () => {
  const write = deferred();
  const mutations = [];
  const state = mount({
    favorites: async () => ['camp-a'],
    notifications: async () => ({ unreadCount: 2 }),
    saveFavorite: async (id) => {
      mutations.push(id);
      await write.promise;
    },
    removeFavorite: async () => {
      throw new Error('Offline');
    },
  });
  assert.deepEqual(state.render().saved, []);
  await flush();
  let value = state.render();
  assert.deepEqual(value.saved, ['camp-a']);
  assert.equal(value.unreadCount, 2);
  const pending = value.toggleSaved('camp-b');
  assert.deepEqual(state.render().saved, ['camp-a']);
  await state.render().toggleSaved('camp-b');
  assert.deepEqual(mutations, ['camp-b'], 'rapid taps cannot send duplicate writes');
  write.resolve();
  await pending;
  value = state.render();
  assert.deepEqual(value.saved, ['camp-b', 'camp-a']);
  await assert.rejects(value.toggleSaved('camp-a'), /Offline/);
  assert.deepEqual(
    state.render().saved,
    ['camp-b', 'camp-a'],
    'failed removal is not shown as successful',
  );
});
test('guest data is empty and stale responses cannot repopulate a discarded account', async () => {
  const read = deferred();
  const old = mount({
    favorites: () => read.promise,
    notifications: async () => ({ unreadCount: 1 }),
  });
  old.render();
  await flush();
  old.unmount();
  const writes = old.writes();
  // A null actor is equivalent to an unauthenticated provider; no request should be attempted.
  const signedOut = mount({}, null);
  const value = signedOut.render();
  assert.deepEqual(value.saved, []);
  assert.equal(value.unreadCount, 0);
  await assert.rejects(value.toggleSaved('camp'), (error) => error.status === 401);
  read.resolve(['old-private-camp']);
  await flush();
  assert.equal(old.writes(), writes, 'late private response must not update an unmounted account');
  assert.deepEqual(signedOut.render().saved, []);
});
test('load failures expose a retry and never invent favorites', async () => {
  let fail = true;
  const state = mount({
    favorites: async () => {
      if (fail) throw new Error('Sem conexão');
      return ['real'];
    },
    notifications: async () => ({ unreadCount: 0 }),
  });
  state.render();
  await flush();
  let value = state.render();
  assert.equal(value.savedError, 'Sem conexão');
  assert.deepEqual(value.saved, []);
  await assert.rejects(value.toggleSaved('camp'), /Atualize/);
  fail = false;
  await value.refreshSaved();
  value = state.render();
  assert.equal(value.savedError, '');
  assert.deepEqual(value.saved, ['real']);
});
