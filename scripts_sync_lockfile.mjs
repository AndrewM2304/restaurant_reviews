import fs from 'node:fs';

const write = process.argv.includes('--write');
const pkgPath = new URL('./package.json', import.meta.url);
const lockPath = new URL('./package-lock.json', import.meta.url);

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

if (!lock.packages || !lock.packages['']) {
  throw new Error('package-lock.json is missing packages[""] root entry');
}

const sortObj = (obj = {}) => Object.fromEntries(Object.entries(obj).sort(([a],[b]) => a.localeCompare(b)));
const pkgDeps = sortObj(pkg.dependencies);
const pkgDevDeps = sortObj(pkg.devDependencies);

const root = lock.packages[''];
const lockDeps = sortObj(root.dependencies);
const lockDevDeps = sortObj(root.devDependencies);

const diffs = [];
if (JSON.stringify(pkgDeps) !== JSON.stringify(lockDeps)) diffs.push('dependencies');
if (JSON.stringify(pkgDevDeps) !== JSON.stringify(lockDevDeps)) diffs.push('devDependencies');

if (!diffs.length) {
  console.log('package.json and package-lock.json root dependencies are in sync.');
  process.exit(0);
}

if (!write) {
  console.error(`Out of sync fields: ${diffs.join(', ')}`);
  console.error('Run: node scripts_sync_lockfile.mjs --write');
  process.exit(1);
}

root.dependencies = pkgDeps;
root.devDependencies = pkgDevDeps;
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log(`Updated package-lock.json root fields: ${diffs.join(', ')}`);
