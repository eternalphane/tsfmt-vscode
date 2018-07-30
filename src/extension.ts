import { ExtensionContext, languages } from 'vscode';

import MessageHelper from './message-helper';
import TsfmtProvider from './tsfmt-provider';

export function activate(context: ExtensionContext): void {
    const provider = new TsfmtProvider();
    context.subscriptions.push(
        languages.registerDocumentFormattingEditProvider('typescript', provider),
        languages.registerDocumentRangeFormattingEditProvider('typescript', provider),
        MessageHelper
    );
}

export function deactivate(): void {
    // cleanup
}
