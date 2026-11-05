import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, dependencies, suffix = '') {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8') + suffix;
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', js)((name) => dependencies[name] ?? require(name), exports);
  return exports;
}

// Drive the mounted item's hook lifecycle without requiring a native UI runtime.
function mountSavedItem(campsite) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let focused = false;
  let focusEffect;
  const memo = (value, deps) => {
    const index = cursor++;
    const previous = slots[index];
    if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
      slots[index] = { value, deps };
      return { value, changed: true };
    }
    return { value: previous.value, changed: false };
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = value;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      return (slots[index] ??= { current: initial });
    },
    useCallback: (callback, deps) => memo(callback, deps).value,
    useEffect(callback, deps) {
      if (memo(callback, deps).changed) effects.push(callback);
    },
  };
  const { useApiResource } = load('../src/hooks/use-api-resource.ts', {
    react,
    '../lib/api': { errorMessage: (error) => error.message },
  });
  const { SavedItem } = load(
    '../src/app/(tabs)/saved.tsx',
    {
      react,
      'expo-router': {
        useFocusEffect(callback) {
          if (callback !== focusEffect) {
            focusEffect = callback;
            if (focused) effects.push(callback);
          }
        },
      },
      'react-native': { View: 'View' },
      '../../components/campsite-card': { CampsiteCard: 'CampsiteCard' },
      '../../components/stitch': { CTA: 'CTA' },
      '../../components/ui': { T: 'T', Notice: 'Notice' },
      '../../lib/i18n': { useTranslation: () => ({ t: (key) => key }) },
      '../../lib/store': {},
      '../../lib/auth': {},
      '../../lib/api': { api: { campsite } },
      '../../hooks/use-api-resource': { useApiResource },
    },
    '\nexport { SavedItem };',
  );
  return {
    render() {
      cursor = 0;
      const tree = SavedItem({ uuid: 'saved-uuid', remove() {} });
      effects.splice(0).forEach((effect) => effect());
      return tree;
    },
    focus() {
      focused = true;
      focusEffect();
    },
    blur() {
      focused = false;
    },
  };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('saved campsite retries on returning to the tab and refreshes its data', async () => {
  let requests = 0;
  const item = mountSavedItem(async (uuid) => {
    assert.equal(uuid, 'saved-uuid');
    requests++;
    if (requests === 1) throw new Error('Sem conexão');
    return { summary: { uuid, name: `Camping ${requests}` } };
  });
  item.render();
  assert.equal(requests, 0, 'hidden tabs should not fetch');
  item.focus();
  await flush();
  assert.match(JSON.stringify(item.render()), /Sem conexão/);
  item.blur();
  item.focus();
  await flush();
  assert.match(JSON.stringify(item.render()), /Camping 2/);
  assert.doesNotMatch(JSON.stringify(item.render()), /Sem conexão/);
  item.blur();
  item.focus();
  await flush();
  assert.match(JSON.stringify(item.render()), /Camping 3/);
  assert.equal(requests, 3, 'one request per focus, none from rerenders');
});
