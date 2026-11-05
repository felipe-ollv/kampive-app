import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const js = ts.transpileModule(readFileSync(new URL('../src/lib/password-recovery.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
}).outputText;
const { validRecoveryToken, validateNewPassword } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('rejects missing, duplicate, malformed tokens and mismatched passwords', () => {
  assert.equal(validRecoveryToken('a'.repeat(43)), true);
  for (const input of [undefined, ['a'.repeat(43)], 'a'.repeat(42), 'https://example.test']) assert.equal(validRecoveryToken(input), false);
  assert.equal(validateNewPassword('New password 7', 'New password 7'), '');
  for (const password of ['short', 'lowercase7', 'No digits here', 'A7' + 'x'.repeat(127)]) assert.ok(validateNewPassword(password, password));
  assert.ok(validateNewPassword('New password 7', 'Other password 7'));
});
