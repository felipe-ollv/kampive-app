import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/api/client.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { createApiClient, ApiError } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('requires HTTPS', () => {
  assert.throws(() => createApiClient('http://localhost:8080'));
});
test('preserves cookie credentials and fetches a fresh CSRF token before each mutation', async () => {
  const calls = [];
  let token = 0;
  const client = createApiClient('https://localhost:8443/', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: `token-${++token}` });
    if (url.endsWith('/logout')) return new Response(null, { status: 204 });
    return json({ uuid: 'user' });
  });
  await Promise.all([client.login(' test@example.test ', 'password'), client.logout()]);
  assert.deepEqual(calls.map(c => new URL(c.url).pathname), ['/api/v1/auth/csrf','/api/v1/auth/login','/api/v1/auth/csrf','/api/v1/auth/logout']);
  assert.ok(calls.every(c => c.credentials === 'include'));
  assert.equal(calls[1].headers['X-CSRF-TOKEN'], 'token-1');
  assert.equal(calls[3].headers['X-CSRF-TOKEN'], 'token-2');
  assert.equal(JSON.parse(calls[1].body).email, 'test@example.test');
});
test('never retries a failed POST or returns raw server errors', async () => {
  let attempts = 0;
  const client = createApiClient('https://localhost:8443', async url => {
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    attempts++;
    return json({ detail: 'SQL secret should never reach the user' }, 500);
  });
  await assert.rejects(client.register({}), e => e instanceof ApiError && e.status === 500 && !e.message.includes('SQL'));
  assert.equal(attempts, 1);
});
test('returns a session error for 401 and a generic connection error for network failure', async () => {
  const rejected = createApiClient('https://localhost:8443', async () => json({}, 401));
  await assert.rejects(rejected.me(), e => e.status === 401 && e.message.includes('sessão'));
  const offline = createApiClient('https://localhost:8443', async () => { throw new Error('secret transport detail'); });
  await assert.rejects(offline.me(), e => e.status === 0 && !e.message.includes('secret'));
});
test('encodes country filters without allowing query injection', async () => {
  let observed;
  const client = createApiClient('https://localhost:8443', async url => { observed = new URL(url); return json({ items: [] }); });
  await client.countries({ query: 'Brazil&size=1000', page: 0, size: 20 });
  assert.equal(observed.searchParams.get('query'), 'Brazil&size=1000');
  assert.equal(observed.searchParams.get('size'), '20');
});
test('refuses an unexpected CSRF header without sending credentials', async () => {
  let calls = 0;
  const client = createApiClient('https://localhost:8443', async () => { calls++; return json({ headerName: 'Authorization', token: 'bad' }); });
  await assert.rejects(client.login('user@example.test', 'password'), ApiError);
  assert.equal(calls, 1);
});
