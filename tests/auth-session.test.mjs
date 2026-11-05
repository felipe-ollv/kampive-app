import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source =
  readFileSync(new URL('../src/lib/auth.tsx', import.meta.url), 'utf8');
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
function mount(api) {
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
    './api': { api, ApiError, errorMessage: (e) => e.message, onSessionExpired: () => () => {} },
  };
  new Function('require', 'exports', code)((name) => dependencies[name] ?? require(name), exports);
  return {
    render() {
      cursor = 0;
      const tree = exports.AuthProvider({ children: null });
      for (const effect of effects.splice(0)) cleanups.push(effect());
      return tree.props.value;
    },
    unmount() {
      for (const cleanup of cleanups) cleanup?.();
    },
    writes: () => writes,
  };
}
test('a fresh launch requires login even with an existing server session', async () => {
  let restores = 0;
  const state = mount({ me: async () => { restores++; return { id: 'existing' }; } });
  assert.equal(state.render().user, null);
  await flush();
  assert.equal(state.render().loading, false);
  assert.equal(state.render().user, null);
  assert.equal(restores, 0);
  state.unmount();
});

test('only successful login unlocks the session and logout clears it', async () => {
  const pending = deferred();
  const user = { id: 'account-a' };
  const state = mount({ login: () => pending.promise, logout: async () => {} });
  const login = state.render().login('email@example.com', 'password');
  assert.equal(state.render().user, null);
  assert.equal(state.render().busy, true);
  pending.resolve(user);
  await login;
  assert.deepEqual(state.render().user, user);
  await state.render().logout();
  assert.equal(state.render().user, null);
  state.unmount();
});

test('failed login keeps the session locked and permits another attempt', async () => {
  const state = mount({ login: async () => { throw new Error('Invalid credentials'); } });
  await assert.rejects(state.render().login('email@example.com', 'wrong'));
  assert.equal(state.render().user, null);
  assert.equal(state.render().busy, false);
  state.unmount();
});

test('clearing a session discards an in-flight login response', async () => {
  const pending = deferred();
  const state = mount({ login: () => pending.promise });
  const login = state.render().login('email@example.com', 'password');
  state.render().clearSession();
  pending.resolve({ id: 'old-account' });
  await login;
  assert.equal(state.render().user, null);
  state.unmount();
});
