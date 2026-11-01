const path = require('node:path');
const fs = require('node:fs');

function load() {
  const root = process.env.INSTITUTION_FRAMEWORK ? path.resolve(process.env.INSTITUTION_FRAMEWORK) : path.resolve(__dirname, '../../../..');
  if (!fs.existsSync(path.join(root, 'extension/packs.js'))) throw new Error('Set INSTITUTION_FRAMEWORK to your in-stitution source checkout. It is a build/test SDK, not a runtime login dependency.');
  return { root, core: require(path.join(root, 'extension/core.js')), packs: require(path.join(root, 'extension/packs.js')),
    archive: require(path.join(root, 'extension/pack-archive.js')), build: require(path.join(root, 'scripts/build-institution.cjs')).build };
}
module.exports = { load };
