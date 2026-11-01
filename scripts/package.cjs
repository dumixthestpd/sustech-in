const path = require('node:path');
const fs = require('node:fs');
const { build } = require('./framework.cjs').load();
const project = path.resolve(__dirname, '..');
const metadata = require('../package.json');
const manifest = require('../pack/manifest.json');
if (metadata.version !== manifest.version) throw new Error('Keep the project and pack versions in sync.');
void build(path.join(project, 'pack'), path.join(project, 'dist')).then(file => {
  const output = path.join(project, 'dist', `${metadata.name}-${metadata.version}.instpack`);
  if (file !== output) { fs.copyFileSync(file, output); fs.unlinkSync(file); }
  console.log(output);
}, () => { console.error('Pack build failed. Check the institution manifest and declared files.'); process.exitCode = 1; });
