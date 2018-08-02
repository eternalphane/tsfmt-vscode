import * as cp from 'child_process';
import * as path from 'path';
import * as semver from 'semver';

const type = process.argv[2] as 'major' | 'minor' | 'patch';
const oldVersion = process.env.npm_package_version!;
const newVersion = semver.inc(oldVersion, type);
const branch = `${'patch' === type ? 'hotfix' : 'release'}-v${newVersion}`;
const options = {
    cwd: path.resolve(__dirname, '..'),
    windowsHide: true
};
cp.execSync('git stash', options);
cp.execSync(`git checkout -b ${branch} v${oldVersion}`, options);
cp.execSync(`npm --no-git-tag-version version ${newVersion}`, options);
cp.execSync(`git commit -a -m "bump version to v${newVersion}"`, options);
try {
    cp.execSync('git stash pop', options);
} catch (e) {
    // do nothing
}
