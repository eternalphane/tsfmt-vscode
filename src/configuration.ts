import { workspace } from 'vscode';

export function tslintAutoFixEnabled(): boolean {
    return 'enabled' === workspace.getConfiguration('tsfmt').get('tslint.autoFix');
}
