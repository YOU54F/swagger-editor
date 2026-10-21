import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, symlink, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cache = path.join(root, '.git-dependencies');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const { apidom: apidomSource, 'arazzo-viewer': viewerSource } = manifest.gitDependencies;

const run = (command, args, cwd) => {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NX_DAEMON: 'false' },
  });
};

const checkout = async (name, repository, revision) => {
  const directory = path.join(cache, `${name}-${revision}`);
  await mkdir(directory, { recursive: true });
  if (!existsSync(path.join(directory, '.git'))) {
    run('git', ['init'], directory);
    run('git', ['remote', 'add', 'origin', repository], directory);
  }
  run('git', ['fetch', '--depth=1', 'origin', revision], directory);
  run('git', ['checkout', '--detach', revision], directory);
  return directory;
};

const linkPackage = async (directory, destination) => {
  const { name } = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  const target = path.join(destination, 'node_modules', name);
  await mkdir(path.dirname(target), { recursive: true });
  await rm(target, { recursive: true, force: true });
  await symlink(directory, target, 'junction');
};

const apidom = await checkout('apidom', apidomSource.repository, apidomSource.revision);
if (!existsSync(path.join(apidom, '.env')) && existsSync(path.join(apidom, '.env.example'))) {
  await copyFile(path.join(apidom, '.env.example'), path.join(apidom, '.env'));
}
run(npm, ['ci'], apidom);
run(npm, ['run', 'build:es'], apidom);

const viewer = await checkout('arazzo-viewer', viewerSource.repository, viewerSource.revision);
run(npm, ['ci', '--dangerously-allow-all-scripts'], viewer);
await linkPackage(path.join(apidom, 'packages/apidom-core'), viewer);
run(npm, ['run', 'build:lib'], viewer);

const packages = await readdir(path.join(apidom, 'packages'), { withFileTypes: true });
await Promise.all(
  packages
    .map((entry) => path.join(apidom, 'packages', entry.name))
    .filter((directory) => existsSync(path.join(directory, 'package.json')))
    .map((directory) => linkPackage(directory, root))
);
await linkPackage(viewer, root);
