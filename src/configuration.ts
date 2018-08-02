import { workspace } from 'vscode';

export function configPath(): string | null {
    return workspace.getConfiguration('tsfmt').get('configPath') || null;
}

export function editorconfigConfigPath(): string | null {
    return workspace.getConfiguration('tsfmt').get('editorconfig.configPath') || null;
}

export function tslintAutoFixEnabled(): boolean {
    return 'enabled' === workspace.getConfiguration('tsfmt').get('tslint.autoFix');
}

export function tslintConfigPath(): string | null {
    return workspace.getConfiguration('tsfmt').get('tslint.configPath') || null;
}
