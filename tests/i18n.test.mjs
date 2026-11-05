import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/i18n/core.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
}).outputText;
const { resolveLanguage, translate, isLanguagePreference, preferenceStorageKey, languages } =
  await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const messages = JSON.parse(
  readFileSync(new URL('../src/lib/i18n/messages.json', import.meta.url), 'utf8'),
);

test('manual language takes precedence over registered country and device', () => {
  for (const language of languages)
    assert.equal(resolveLanguage(language, 'BR', ['en-US']), language);
});
test('registered country determines automatic language', () => {
  for (const [country, language] of [
    ['BR', 'pt'],
    ['PT', 'pt'],
    ['AO', 'pt'],
    ['US', 'en'],
    ['GB', 'en'],
    ['FR', 'fr'],
    ['SN', 'fr'],
    ['ES', 'es'],
    ['MX', 'es'],
    ['AR', 'es'],
  ]) {
    assert.equal(resolveLanguage('auto', country, ['en-US']), language);
  }
  assert.equal(resolveLanguage('auto', ' br ', ['es-ES']), 'pt');
});
test('multilingual countries use matching device preference, then country default', () => {
  assert.equal(resolveLanguage('auto', 'CA', ['fr-CA', 'en-CA']), 'fr');
  assert.equal(resolveLanguage('auto', 'CA', ['en-CA', 'fr-CA']), 'en');
  assert.equal(resolveLanguage('auto', 'CA', ['pt-BR']), 'en');
  assert.equal(resolveLanguage('auto', 'CH', ['fr-CH']), 'fr');
});
test('missing country follows device; unsupported country/language uses English', () => {
  assert.equal(resolveLanguage('auto', null, ['de-DE', 'es-MX']), 'es');
  assert.equal(resolveLanguage('auto', undefined, ['fr-FR']), 'fr');
  assert.equal(resolveLanguage('auto', 'JP', ['pt-BR']), 'en');
  assert.equal(resolveLanguage('auto', null, ['ja-JP']), 'en');
  assert.equal(resolveLanguage('auto', null, []), 'en');
});
test('stored preferences are validated and isolated by account', () => {
  for (const value of [...languages, 'auto']) assert.ok(isLanguagePreference(value));
  for (const value of [null, undefined, '', 'de', 'constructor', {}, 'pt-BR'])
    assert.equal(isLanguagePreference(value), false);
  assert.notEqual(preferenceStorageKey('account-a'), preferenceStorageKey('account-b'));
});
test('all messages have complete translations and preserve interpolation variables', () => {
  const variables = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [key, translations] of Object.entries(messages)) {
    for (const language of ['en', 'es', 'fr']) {
      assert.equal(typeof translations[language], 'string', `${key}: ${language}`);
      assert.ok(translations[language].trim(), `${key}: ${language}`);
      assert.deepEqual(variables(translations[language]), variables(key), `${key}: ${language}`);
    }
  }
});
test('translation interpolates values without recursively treating user text as a message', () => {
  assert.equal(translate(messages, 'en', 'Perfil'), 'Profile');
  assert.equal(translate(messages, 'fr', 'Perfil'), 'Profil');
  assert.equal(translate(messages, 'es', 'Entrar'), 'Iniciar sesión');
  assert.equal(translate(messages, 'pt', 'Perfil'), 'Perfil');
  assert.equal(
    translate(messages, 'en', 'Ver {name}', { name: 'Perfil {number}' }),
    'View Perfil {number}',
  );
  assert.equal(translate(messages, 'en', 'unknown message'), 'unknown message');
  assert.equal(
    translate(messages, 'en', '{count} notificação não lida', { count: 1 }),
    '1 unread notification',
  );
  assert.equal(
    translate(messages, 'en', '{count} notificações não lidas', { count: 2 }),
    '2 unread notifications',
  );
});
