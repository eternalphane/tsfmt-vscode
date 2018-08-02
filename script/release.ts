import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request-promise-native';
import * as ut from 'url-template';

(async () => {
    const version = process.env.npm_package_version!;
    const options = {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf8',
        windowsHide: true
    };
    cp.execSync('code-insiders -r -w CHANGELOG.md', options);
    const releaseInfo = fs.readFileSync(path.resolve(__dirname, '../CHANGELOG.md'), 'utf8')
        .replace(/\r\n/g, '\n')
        .split('\n\n')
        .filter((str) => str.startsWith(`## [v${version}]`))[0]
        .split('\n')
        .slice(1)
        .join('\n');
    cp.execSync('git commit -a -m "update CHANGELOG.md"', options);
    const branch = cp.execSync(
        'cmd /c chcp 65001>nul && git symbolic-ref --short HEAD',
        options as cp.ExecFileSyncOptionsWithStringEncoding
    );
    cp.execSync('git checkout master', options);
    cp.execSync(`git merge --no-ff ${branch}`, options);
    cp.execSync(`git tag -a v${version} -m "v${version}"`, options);
    cp.execSync(`git branch -d ${branch}`, options);
    cp.execSync('git push --follow-tags', options);
    cp.execSync('vsce publish', options);
    cp.execSync('vsce package', options);
    const pack = `tsfmt-vscode-${version}.vsix`;
    const token = fs.readFileSync('token', 'utf8');
    const rawUploadUrl = (await request(
        'https://api.github.com/repos/EternalPhane/tsfmt-vscode/releases', {
            method: 'POST',
            headers: {
                Authorization: `token ${token}`,
                'User-Agent': 'EternalPhane'
            },
            body: {
                tag_name: `v${version}`,
                target_commitish: 'master',
                name: `v${version}`,
                body: releaseInfo
            },
            json: true,
            proxy: 'http://127.0.0.1:8118'
        }
    )).upload_url;
    const uploadUrl = ut.parse(rawUploadUrl).expand({ name: pack });
    const packPath = path.resolve(__dirname, `../${pack}`);
    const packSize = fs.statSync(packPath).size;
    let uploadedSize = 0;
    await request(uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'EternalPhane'
        },
        formData: {
            file: {
                value: fs.createReadStream(packPath)
                    .on('data', (buffer) => {
                        uploadedSize += buffer.length;
                        process.stdout.write(
                            `uploading...${(uploadedSize / packSize * 100).toFixed(2)}%\r`
                        );
                    })
                    .on('end', () => {
                        console.log();
                    }),
                options: {
                    filename: pack,
                    contentType: 'application/octet-stream'
                }
            }
        },
        proxy: 'http://127.0.0.1:8118'
    });
})();
