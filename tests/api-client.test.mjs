import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/api/client.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { createApiClient, ApiError, onSessionExpired } = await import(
  'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
);
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('requires HTTPS', () => {
  assert.throws(() => createApiClient('http://localhost:8080'));
});
test('preserves cookie credentials and fetches a fresh CSRF token before each mutation', async () => {
  const calls = [];
  let token = 0;
  const client = createApiClient('https://localhost:8443/', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf'))
      return json({ headerName: 'X-CSRF-TOKEN', token: `token-${++token}` });
    if (url.endsWith('/logout')) return new Response(null, { status: 204 });
    return json({ uuid: 'user' });
  });
  await Promise.all([client.login(' test@example.test ', 'password'), client.logout()]);
  assert.deepEqual(
    calls.map((c) => new URL(c.url).pathname),
    ['/api/v1/auth/csrf', '/api/v1/auth/login', '/api/v1/auth/csrf', '/api/v1/auth/logout'],
  );
  assert.ok(calls.every((c) => c.credentials === 'include'));
  assert.equal(calls[1].headers['X-CSRF-TOKEN'], 'token-1');
  assert.equal(calls[3].headers['X-CSRF-TOKEN'], 'token-2');
  assert.equal(JSON.parse(calls[1].body).email, 'test@example.test');
});
test('never retries a failed POST or returns raw server errors', async () => {
  let attempts = 0;
  const client = createApiClient('https://localhost:8443', async (url) => {
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    attempts++;
    return json({ detail: 'SQL secret should never reach the user' }, 500);
  });
  await assert.rejects(
    client.register({}),
    (e) => e instanceof ApiError && e.status === 500 && !e.message.includes('SQL'),
  );
  assert.equal(attempts, 1);
});
test('returns a session error for 401 and a generic connection error for network failure', async () => {
  const rejected = createApiClient('https://localhost:8443', async () => json({}, 401));
  await assert.rejects(rejected.me(), (e) => e.status === 401 && e.message.includes('sessão'));
  const offline = createApiClient('https://localhost:8443', async () => {
    throw new Error('secret transport detail');
  });
  await assert.rejects(offline.me(), (e) => e.status === 0 && !e.message.includes('secret'));
});
test('encodes country filters without allowing query injection', async () => {
  let observed;
  const client = createApiClient('https://localhost:8443', async (url) => {
    observed = new URL(url);
    return json({ items: [] });
  });
  await client.countries({ query: 'Brazil&size=1000', page: 0, size: 20 });
  assert.equal(observed.searchParams.get('query'), 'Brazil&size=1000');
  assert.equal(observed.searchParams.get('size'), '20');
});
test('refuses an unexpected CSRF header without sending credentials', async () => {
  let calls = 0;
  const client = createApiClient('https://localhost:8443', async () => {
    calls++;
    return json({ headerName: 'Authorization', token: 'bad' });
  });
  await assert.rejects(client.login('user@example.test', 'password'), ApiError);
  assert.equal(calls, 1);
});

test('campsite writes use their HTTP method, fresh CSRF and encoded resource UUID', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    return url.endsWith('/csrf')
      ? json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' })
      : json({ summary: { uuid: 'camp' } });
  });
  const body = { name: 'Camp', categoryUuid: 'category', photos: [] };
  await client.suggestCampsite({
    name: 'Camp',
    instagramUrl: 'https://instagram.com/camp/',
    googleMapsUrl: 'https://maps.app.goo.gl/example',
  });
  await client.updateCampsite('camp/test', body);
  await client.submitCampsite('camp/test');
  await client.archiveCampsite('camp/test');
  const writes = calls.filter((c) => c.method !== 'GET');
  assert.deepEqual(
    writes.map((c) => c.method),
    ['POST', 'PUT', 'POST', 'POST'],
  );
  assert.equal(writes[1].url, 'https://localhost:8443/api/v1/campsites/camp%2Ftest');
  assert.deepEqual(JSON.parse(writes[1].body), body);
  assert.ok(
    writes.every((c) => c.headers['X-CSRF-TOKEN'] === 'fresh' && c.credentials === 'include'),
  );
  assert.equal(calls.filter((c) => c.url.endsWith('/csrf')).length, 4);
});
test('campsite queries preserve UUID filters and literal search; status conflicts are actionable', async () => {
  let called;
  const client = createApiClient('https://localhost:8443', async (url) => {
    called = new URL(url);
    return json({});
  });
  await client.campsites({ countryUuid: 'country', amenityUuid: 'water', query: 'A&B', page: 2 });
  assert.equal(called.searchParams.get('query'), 'A&B');
  assert.equal(called.searchParams.get('page'), '2');
  assert.equal(called.searchParams.get('amenityUuid'), 'water');
  const conflict = createApiClient('https://localhost:8443', async (url) =>
    url.endsWith('/csrf') ? json({ headerName: 'X-CSRF-TOKEN', token: 'test' }) : json({}, 409),
  );
  await assert.rejects(
    conflict.submitCampsite('uuid'),
    (e) => e.status === 409 && e.message.includes('status'),
  );
});
const formSource = readFileSync(new URL('../src/lib/campsite-form.ts', import.meta.url), 'utf8');
const formJs = ts.transpileModule(formSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { blankCampsite, decimalInput, validateCampsite } = await import(
  'data:text/javascript;base64,' + Buffer.from(formJs).toString('base64')
);
test('draft validation allows incomplete location but submission needs required data', () => {
  const draft = { ...blankCampsite(), name: 'Test camping', categoryUuid: 'category' };
  assert.equal(validateCampsite(draft, false), '');
  assert.ok(validateCampsite(draft, true));
  const full = {
    ...draft,
    cityUuid: 'city',
    description: 'Description',
    streetAddress: 'Street',
    latitude: 0,
    longitude: 0,
    contacts: [{ typeUuid: 'phone', value: '123' }],
    photos: [{ url: 'https://example.test/1.jpg', description: '' }],
  };
  assert.equal(validateCampsite(full, true), '');
  assert.ok(validateCampsite({ ...full, longitude: null }, false));
  assert.ok(validateCampsite({ ...full, startingPricePerNight: 10 }, false));
});
test('photo validation rejects local files, credentials, duplicates and a tenth photo', () => {
  const draft = { ...blankCampsite(), name: 'Test camp', categoryUuid: 'category' };
  const photos = Array.from({ length: 9 }, (_, i) => ({
    url: `https://example.test/${i}.jpg`,
    description: '',
  }));
  assert.equal(validateCampsite({ ...draft, photos }, false), '');
  for (const invalid of [
    [...photos, { url: 'https://example.test/10.jpg' }],
    [photos[0], photos[0]],
    [{ url: 'file:///photo.jpg' }],
    [{ url: 'https://user:pass@example.test/photo.jpg' }],
    [{ url: 'javascript:alert(1)' }],
  ])
    assert.ok(validateCampsite({ ...draft, photos: invalid }, false));
});
test('decimal input preserves zero and rejects invalid or excessive precision', () => {
  assert.equal(decimalInput('', 0, 100, 2), null);
  assert.equal(decimalInput('0', 0, 100, 2), 0);
  assert.equal(decimalInput('75,50', 0, 100, 2), 75.5);
  for (const value of ['NaN', 'Infinity', '1e2', '100.01', '0.001', 'abc'])
    assert.throws(() => decimalInput(value, 0, 100, 2));
});

test('claim requests encode campsite IDs and preserve private evidence with CSRF', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    return url.endsWith('/csrf')
      ? json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' })
      : json({ uuid: 'claim', status: 'pending_review' });
  });
  const input = { contact: 'phone', evidence: 'Please contact me' };
  const receipt = await client.claimCampsite('camp/test', input);
  assert.equal(receipt.status, 'pending_review');
  assert.equal(calls[1].url, 'https://localhost:8443/api/v1/campsites/camp%2Ftest/claims');
  assert.deepEqual(JSON.parse(calls[1].body), input);
  assert.equal(calls[1].headers['X-CSRF-TOKEN'], 'fresh');
  assert.equal(client.createCampsite, undefined);
});

const suggestionSource = readFileSync(
  new URL('../src/lib/campsite-suggestion.ts', import.meta.url),
  'utf8',
);
const suggestionJs = ts.transpileModule(suggestionSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { validateSuggestion } = await import(
  'data:text/javascript;base64,' + Buffer.from(suggestionJs).toString('base64')
);
test('suggestions require a profile, Google Maps link and name', () => {
  const input = {
    name: 'Camping',
    instagramUrl: 'https://www.instagram.com/camping/',
    googleMapsUrl: 'https://maps.app.goo.gl/example',
  };
  assert.equal(validateSuggestion(input), '');
  for (const googleMapsUrl of [
    'https://www.google.com/maps/place/Camp',
    'https://goo.gl/maps/example',
    'https://maps.google.com/?q=camp',
  ])
    assert.equal(validateSuggestion({ ...input, googleMapsUrl }), '');
  for (const instagramUrl of [
    '',
    'https://instagram.com.evil.test/camp',
    'https://instagram.com/p/photo',
    'http://instagram.com/camp/',
    'https://user:pass@instagram.com/camp/',
  ])
    assert.ok(validateSuggestion({ ...input, instagramUrl }));
  for (const googleMapsUrl of [
    '',
    'https://example.test/maps',
    'https://google.com/search?q=camp',
    'https://google.com.evil.test/maps',
  ])
    assert.ok(validateSuggestion({ ...input, googleMapsUrl }));
  assert.ok(validateSuggestion({ ...input, name: '  ' }));
});

test('full registration posts content for review without granting ownership', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    return url.endsWith('/csrf')
      ? json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' })
      : json({ uuid: 'camp', status: 'pending_review' });
  });
  const content = { name: 'Camping', categoryUuid: 'category', photos: [] };
  const receipt = await client.registerCampsite(content);
  assert.equal(receipt.status, 'pending_review');
  assert.equal(calls[1].url, 'https://localhost:8443/api/v1/campsite-registrations');
  assert.deepEqual(JSON.parse(calls[1].body), content);
  assert.equal(calls[1].headers['X-CSRF-TOKEN'], 'fresh');
});

test('profile updates and account deletion require fresh CSRF and correct verbs', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' });
    return options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : json({ name: 'Explorer' });
  });
  const input = {
    name: 'Explorer',
    countryUuid: null,
    cityUuid: null,
    bio: '',
    travelStyles: ['tent', 'trailer'],
    photoUrl: null,
  };
  await client.updateProfile(input);
  await client.deleteAccount('current password');
  assert.deepEqual(
    calls.map((call) => call.method),
    ['GET', 'PUT', 'GET', 'DELETE'],
  );
  assert.deepEqual(JSON.parse(calls[1].body), input);
  assert.deepEqual(JSON.parse(calls[3].body), {
    password: 'current password',
    confirmation: 'EXCLUIR',
  });
  assert.equal(calls[3].headers['X-CSRF-TOKEN'], 'fresh');
});

const profileJs = ts.transpileModule(
  readFileSync(new URL('../src/lib/profile.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  },
).outputText;
const { validateProfile } = await import(
  'data:text/javascript;base64,' + Buffer.from(profileJs).toString('base64')
);
test('profile accepts multiple travel styles and rejects invalid location and duplicated styles', () => {
  const input = {
    name: 'Explorer',
    countryUuid: null,
    cityUuid: null,
    bio: '',
    travelStyles: ['tent', 'trailer'],
    photoUrl: null,
  };
  assert.equal(validateProfile(input), '');
  assert.ok(validateProfile({ ...input, travelStyles: ['tent', 'tent'] }));
  assert.ok(validateProfile({ ...input, travelStyles: ['invalid'] }));
  assert.ok(validateProfile({ ...input, cityUuid: 'city' }));
  assert.ok(validateProfile({ ...input, bio: 'a'.repeat(501) }));
});

test('community mutations use session-scoped paths, fresh CSRF and correct methods', async () => {
  const calls = [];
  const client = createApiClient('https://example.test', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' });
    if (url.endsWith('/reviews')) return json({ uuid: 'review', status: 'pending' }, 201);
    return new Response(null, { status: 204 });
  });
  await client.saveFavorite('camp/one');
  await client.removeFavorite('camp/one');
  await client.setNotificationRead('notice/one', false);
  await client.readAllNotifications();
  const review = {
    rating: 4,
    text: 'My visit',
    campingMethodUuid: null,
    highlightUuids: [],
    photos: [],
  };
  await client.createReview('camp/one', review);
  const writes = calls.filter((call) => !call.url.endsWith('/csrf'));
  assert.deepEqual(
    writes.map((call) => [new URL(call.url).pathname, call.method]),
    [
      ['/api/v1/users/me/favorites/camp%2Fone', 'PUT'],
      ['/api/v1/users/me/favorites/camp%2Fone', 'DELETE'],
      ['/api/v1/users/me/notifications/notice%2Fone', 'PUT'],
      ['/api/v1/users/me/notifications/read-all', 'POST'],
      ['/api/v1/campsites/camp%2Fone/reviews', 'POST'],
    ],
  );
  assert.equal(calls.length, 10);
  for (const call of writes) {
    assert.equal(call.headers['X-CSRF-TOKEN'], 'fresh');
    assert.equal(call.credentials, 'include');
  }
  assert.deepEqual(JSON.parse(writes[2].body), { read: false });
  assert.deepEqual(JSON.parse(writes[4].body), review);
});
test('community reads keep pagination and filters; review conflicts never masquerade as success', async () => {
  const urls = [];
  const client = createApiClient('https://example.test', async (url) => {
    urls.push(url);
    return json({ items: [] });
  });
  await client.favorites();
  await client.notifications(2, 'unread');
  await client.reviews('a/b', 3);
  await client.myReviews(4);
  await client.reviewOptions();
  assert.deepEqual(
    urls.map((url) => url.replace('https://example.test/api/v1', '')),
    [
      '/users/me/favorites',
      '/users/me/notifications?page=2&size=20&filter=unread',
      '/campsites/a%2Fb/reviews?page=3&size=10',
      '/users/me/reviews?page=4&size=10',
      '/review-options',
    ],
  );
  const failing = createApiClient('https://example.test', async (url) =>
    url.endsWith('/csrf') ? json({ headerName: 'X-CSRF-TOKEN', token: 'fresh' }) : json({}, 409),
  );
  await assert.rejects(
    failing.createReview('camp', {}),
    (error) => error.status === 409 && /já enviou uma avaliação/.test(error.message),
  );
});

test('request tracking uses session-scoped reads and encodes identifiers', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    return json({ items: [], totalElements: 0 });
  });
  await client.myRequests(2);
  await client.myRequest('suggestion', 'id/with?query');
  assert.ok(calls[0].url.endsWith('/users/me/requests?page=2&size=20'));
  assert.ok(calls[1].url.endsWith('/users/me/requests/suggestion/id%2Fwith%3Fquery'));
  assert.ok(calls.every((call) => call.credentials === 'include' && !call.body));
});

test('password recovery and reset use CSRF and never put secrets in request URLs', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    return new Response(null, { status: 204 });
  });
  await client.requestPasswordRecovery('  a@example.test  ');
  await client.resetPassword('secret-reset-token', 'New password 7');
  const writes = calls.filter((call) => call.method === 'POST');
  assert.equal(writes.length, 2);
  assert.equal(JSON.parse(writes[0].body).email, 'a@example.test');
  assert.equal(JSON.parse(writes[1].body).token, 'secret-reset-token');
  for (const call of writes) {
    assert.equal(call.headers['X-CSRF-TOKEN'], 'csrf');
    assert.ok(!call.url.includes('secret-reset-token'));
  }
});


test('private 401 responses clear the local session, invalid login does not', async () => {
  let expired = 0;
  const unsubscribe = onSessionExpired(() => { expired++; });
  const client = createApiClient('https://localhost:8443', async (url) => url.endsWith('/csrf')
    ? json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' }) : json({}, 401));
  try {
    await assert.rejects(client.login('a@example.test', 'wrong'));
    assert.equal(expired, 0);
    await assert.rejects(client.me());
    assert.equal(expired, 1);
  } finally { unsubscribe(); }
});

test('email confirmation uses CSRF and never puts its token in a request URL', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    return new Response(null, { status: 204 });
  });
  await client.confirmEmail('private-token');
  assert.equal(calls[1].method, 'POST');
  assert.equal(calls[1].headers['X-CSRF-TOKEN'], 'csrf');
  assert.equal(JSON.parse(calls[1].body).token, 'private-token');
  assert.ok(calls.every((call) => !call.url.includes('private-token')));
});

test('verification denial has a distinct actionable message without exposing backend details', async () => {
  const client = createApiClient('https://localhost:8443', async (url) => {
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    return json({ code: 'EMAIL_VERIFICATION_REQUIRED', detail: 'private detail' }, 403);
  });
  await assert.rejects(client.resendVerification(), (e) => e.status === 403 && e.message.includes('Confirme seu e-mail') && !e.message.includes('private detail'));
});

test('review management uses private routes and fresh CSRF for update and deletion', async () => {
  const calls = [];
  const client = createApiClient('https://localhost:8443', async (url, options) => {
    calls.push({ url, ...options });
    if (url.endsWith('/csrf')) return json({ headerName: 'X-CSRF-TOKEN', token: 'csrf' });
    return options.method === 'DELETE' ? new Response(null, { status: 204 }) : json({ uuid: 'review', status: 'pending' });
  });
  await client.myReview('review');
  await client.updateReview('review', { rating: 4, text: 'An updated review', photos: [], highlightUuids: [], campingMethodUuid: null });
  await client.deleteReview('review');
  assert.deepEqual(calls.map((call) => call.method), ['GET', 'GET', 'PUT', 'GET', 'DELETE']);
  assert.equal(calls[2].headers['X-CSRF-TOKEN'], 'csrf');
  assert.equal(calls[4].headers['X-CSRF-TOKEN'], 'csrf');
  assert.ok(calls.filter((call) => call.method !== 'GET').every((call) => call.url.endsWith('/users/me/reviews/review')));
});
