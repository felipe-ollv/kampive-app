import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const js = ts.transpileModule(readFileSync(new URL('../src/lib/profile.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
}).outputText;
const { hasProfileChanges } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const saved = {
  name: 'Felipe Oliveira', bio: 'Camping', countryUuid: 'br', cityUuid: 'city',
  travelStyles: ['tent', 'trailer'], photoUrl: 'https://example.com/photo.jpg',
};

test('unchanged profile, trimmed whitespace and reordered styles do not enable saving', () => {
  assert.equal(hasProfileChanges({ ...saved }, saved), false);
  assert.equal(hasProfileChanges({ ...saved, name: ' Felipe Oliveira ', bio: 'Camping ' }, saved), false);
  assert.equal(hasProfileChanges({ ...saved, travelStyles: ['trailer', 'tent'] }, saved), false);
});

test('each editable field enables saving and reverting disables it again', () => {
  for (const [field, value] of Object.entries({
    name: 'Outro nome', bio: '', countryUuid: 'ar', cityUuid: null,
    travelStyles: ['tent'], photoUrl: null,
  })) {
    const edited = { ...saved, [field]: value };
    assert.equal(hasProfileChanges(edited, saved), true, field);
    assert.equal(hasProfileChanges({ ...edited, [field]: saved[field] }, saved), false, field);
  }
});
