import {
    CancellationToken,
    DocumentFormattingEditProvider,
    DocumentRangeFormattingEditProvider,
    FormattingOptions,
    Range,
    TextDocument,
    TextEdit
} from 'vscode';

import { tslintAutoFixEnabled } from './configuration';
import { diagnose, format, tslintFix } from './formatting';
import MessageHelper from './message-helper';

export default class TsfmtProvider
    implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: TextDocument,
        options: FormattingOptions,
        token: CancellationToken
    ): Promise<TextEdit[]> {
        return this._format(document);
    }

    public provideDocumentRangeFormattingEdits(
        document: TextDocument,
        range: Range,
        options: FormattingOptions,
        token: CancellationToken
    ): Promise<TextEdit[]> {
        return this._format(document, range);
    }

    private async _format(document: TextDocument, range?: Range): Promise<TextEdit[]> {
        const source = document.getText(range);
        const diagnostics = diagnose(source, document.uri);
        if (diagnostics.length) {
            const errors: string[] = [];
            for (const diagnostic of diagnostics) {
                const { line, character } = document.positionAt(
                    (range ? document.offsetAt(range.start) : 0) + diagnostic.start!
                );
                errors.push(
                    `${document.fileName}(${line + 1},${character}) error TS${diagnostic.code}: ${
                        diagnostic.messageText
                    }`
                );
            }
            MessageHelper.show('Formatting failed', 'error', errors.join('\n'));
            return [];
        }
        let result = await format(source, document.uri);
        tslintAutoFixEnabled() && (result = tslintFix(result, document.uri));
        range &&
            (result = result
                .split('\n')
                .map((l) => `${' '.repeat(range.start.character)}${l}`)
                .join('\n')
                .slice(range.start.character));
        return [
            TextEdit.replace(
                range ||
                    new Range(
                        0,
                        0,
                        document.lineCount - 1,
                        document.lineAt(document.lineCount - 1).text.length
                    ),
                result
            )
        ];
    }
}
