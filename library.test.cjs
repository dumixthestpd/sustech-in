const test = require('node:test');
const assert = require('node:assert/strict');
const { core } = require('./scripts/framework.cjs').load();
require('./index.js');
const library = globalThis.InstitutionLibraries.get('sustech');

test('SUSTech owns canonical origin validation and historical institution aliases', () => {
  const preset = library.preset;
  const saved = core.normalizeProfile({ ...preset, aliases: ['南方科技大学'] });
  for (const label of ['SOUTHERN UNIV SCI & TECHLGY CHINA', 'SOUTH UNIVERSITY OF SCIENCE AND TECHNOLOGY OF CHINA (SUSTC)', 'South University of Science & Technology']) assert.equal(core.isInstitution(label, saved), true, label);
  const other = core.normalizeProfile({ id: 'other', name: 'Other University' });
  assert.equal(core.isInstitution('SOUTHERN UNIV SCI & TECHLGY CHINA', other), false);
  assert.throws(() => core.normalizeProfile({ ...preset, entityId: 'https://evil.test/idp' }), /canonical/);
  assert.throws(() => core.normalizeProfile({ ...preset, cas: { loginUrl: 'https://evil.test/login', servicePrefixes: ['https://evil.test/'] } }), /canonical/);
  assert.equal(core.isCredentialPage('https://cas.sustech.edu.cn/cas/login?service=https://tis.sustech.edu.cn/cas', saved), false);
});

test('SUSTech migrates legacy state without overwriting scoped credentials or leaking them into profiles', async () => {
  const data = { credentials: { username: 'legacy-fixture', password: 'legacy-fixture' }, settings: { autoSubmit: true } };
  const storage = { async get(key) { return { [key]: data[key] }; }, async set(value) { Object.assign(data, value); }, async remove(key) { delete data[key]; } };
  await library.migrate(storage, core);
  assert.equal(data['credentials:sustech'].username, 'legacy-fixture');
  assert.equal(data['credentials:sustech'].scope, core.credentialScope(library.preset));
  assert.equal(data['settings:sustech'].autoSubmit, true);
  assert.equal(data.credentials, undefined);
  assert.equal(data.settings, undefined);
  assert.equal(JSON.stringify(library.preset).includes('legacy-fixture'), false);
  data.credentials = { username: 'older-fixture', password: 'older-fixture' };
  await library.migrate(storage, core);
  assert.equal(data['credentials:sustech'].username, 'legacy-fixture');
});
