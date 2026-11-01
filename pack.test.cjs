const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { packs, core } = require('./scripts/framework.cjs').load();
const directory = path.join(__dirname, 'pack');
const manifest = require('./pack/manifest.json');
const resources = Object.fromEntries(manifest.adapter.resources.map(name => [name, fs.readFileSync(path.join(directory, name), 'utf8')]));
const source = fs.readFileSync(path.join(directory, 'adapter.js'), 'utf8');

test('sustech-in prepares independently without registering a university in core', async () => {
  const pack = await packs.prepare({ ...manifest, files: { ...resources, 'adapter.js': source } });
  for (const [name, code] of Object.entries(pack.files)) if (name.endsWith('.js')) new vm.Script(code, { filename: name });
  assert.equal(pack.version, require('./package.json').version);
  assert.equal(core.libraries().some(item => item.id === 'sustech'), false);
  assert.equal(pack.institution.library, 'executable-pack');
  assert.equal(pack.adapter.returnOrigins.includes('https://pubs.rsc.org'), true);
  assert.equal(pack.institution.cas, null);
});

function fixture({ service = 'https://idp.sustech.edu.cn/idp/Authn/External', captcha = false, autoSubmit = true, browserOnly = true, action = '/cas/login', response = { opaqueRedirect: true }, reject = false } = {}) {
  let adapter;
  let submits = 0;
  let state = {};
  const requests = []; const navigations = []; const notices = [];
  class Input { get value() { return this.content || ''; } set value(value) { this.content = value; } dispatchEvent() {} }
  class Form { requestSubmit() { submits++; } }
  const form = new Form();
  Object.assign(form, { method: 'post', getAttribute: () => action, querySelectorAll: selector => selector.startsWith('input[type="hidden"]') ? [{ name: 'execution', value: 'fixture-execution' }, { name: '_csrf', value: 'fixture-csrf' }] : [{ form, name: 'submit', value: '登录' }] });
  const username = new Input(); const password = new Input(); username.form = form; password.form = form;
  const document = { querySelector: (selector) => selector.startsWith('input[name="username"') ? username : selector.startsWith('input[name="password"') ? password : captcha ? {} : null, querySelectorAll: () => [] };
  vm.runInNewContext(source, { InstitutionPack: { register(value) { adapter = value; } }, URL, URLSearchParams, location: new URL('https://cas.sustech.edu.cn/cas/login?service=' + encodeURIComponent(service)), document, HTMLInputElement: Input, HTMLFormElement: Form, Event: class {}, Object });
  const ctx = { resources, config: { account: { username: 'fixture-user', password: 'fixture-password' }, autoSubmit, browserOnly }, flowId: 'fixture-flow', local: {}, current: () => true, notice: async text => { notices.push(text); }, storage: { get: async () => state, set: async value => { state = value; } },
    request: async (url, options) => { requests.push({ url, options }); if (reject) throw new Error('fixture network failure'); return response; }, navigate: async (key, url) => { navigations.push({ key, url }); } };
  return { run: () => adapter(ctx), ctx, username, password, requests, navigations, notices, submits: () => submits };
}

test('visible-form compatibility fills and submits its approved CAS flow once, with opt-in', async () => {
  const f = fixture();
  await f.run();
  assert.equal(f.username.value, 'fixture-user');
  assert.equal(f.password.value, 'fixture-password');
  assert.equal(f.submits(), 1);
  f.ctx.local = {};
  await f.run();
  assert.equal(f.submits(), 1);
  const manual = fixture({ autoSubmit: false });
  await manual.run();
  assert.equal(manual.password.value, 'fixture-password');
  assert.equal(manual.submits(), 0);
});

test('automatic login posts through the worker without exposing the account to page inputs', async () => {
  const f = fixture({ browserOnly: false });
  await f.run();
  assert.equal(f.password.value, ''); assert.equal(f.username.value, ''); assert.equal(f.submits(), 0);
  assert.equal(f.requests.length, 1);
  const { url, options } = f.requests[0];
  assert.equal(new URL(url).origin, 'https://cas.sustech.edu.cn');
  assert.equal(options.method, 'POST'); assert.equal(options.redirect, 'manual');
  const fields = new URLSearchParams(options.body);
  assert.equal(fields.get('execution'), 'fixture-execution'); assert.equal(fields.get('_csrf'), 'fixture-csrf');
  assert.equal(fields.get('username'), 'fixture-user'); assert.equal(fields.get('password'), 'fixture-password');
  assert.equal(fields.get('_eventId'), 'submit');
  assert.equal(f.navigations.length, 1);
  assert.equal(new URL(f.navigations[0].url).searchParams.get('service'), 'https://idp.sustech.edu.cn/idp/Authn/External');
  f.ctx.local = {}; await f.run(); assert.equal(f.requests.length, 1);
});

test('unconfirmed background results never trigger another POST or a visible-form fallback', async () => {
  for (const options of [{ response: { ok: true, status: 200, body: 'Incorrect account' } }, { reject: true }]) {
    const f = fixture({ browserOnly: false, ...options });
    await f.run(); f.ctx.local = {}; await f.run();
    assert.equal(f.requests.length, 1); assert.equal(f.submits(), 0); assert.equal(f.navigations.length, 0); assert.equal(f.password.value, '');
    assert.ok(f.notices.some(text => /Continue|continue/.test(text)));
  }
});

test('background login respects verification, service/action checks, cancellation and manual submission', async () => {
  for (const options of [{ captcha: true }, { service: 'https://tis.sustech.edu.cn/cas' }, { action: 'https://evil.test/cas/login' }, { action: '/cas/login?service=https://tis.sustech.edu.cn/cas' }]) {
    const f = fixture({ browserOnly: false, ...options }); await f.run(); assert.equal(f.requests.length, 0); assert.equal(f.password.value, '');
  }
  const stopped = fixture({ browserOnly: false }); stopped.ctx.current = () => false; await stopped.run(); assert.equal(stopped.requests.length, 0);
  const manual = fixture({ browserOnly: false, autoSubmit: false }); await manual.run(); assert.equal(manual.requests.length, 0); assert.equal(manual.password.value, 'fixture-password');
  const legacy = fixture({ browserOnly: false }); legacy.ctx.settings = { browserOnly: true }; await legacy.run(); assert.equal(legacy.requests.length, 0); assert.equal(legacy.submits(), 1);
});

test('other CAS services and verification challenges never receive the saved account', async () => {
  for (const options of [{ service: 'https://tis.sustech.edu.cn/cas' }, { service: 'https://idp.sustech.edu.cn.evil.test/idp/' }, { captcha: true }]) {
    const f = fixture(options); await f.run(); assert.equal(f.password.value, ''); assert.equal(f.submits(), 0);
  }
});

test('publisher return completion belongs to the institution pack', async () => {
  let adapter; let completed = false;
  vm.runInNewContext(source, { InstitutionPack: { register(value) { adapter = value; } }, location: new URL('https://pubs.rsc.org/article/fixture') });
  await adapter({ resources, config: {}, pageRole: 'return', researchPage: true, complete: async () => { completed = true; } });
  assert.equal(completed, true);
});
