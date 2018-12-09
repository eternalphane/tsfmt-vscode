import { OutputChannel, window } from 'vscode';

import { logLevel, showNotification } from './configuration';

export default class MessageHelper {
    public static readonly channel: OutputChannel = window.createOutputChannel(
        'TypeScript Formatter'
    );

    public static dispose(): void {
        this.channel.dispose();
    }

    public static show(
        message: string,
        type: 'information' | 'warning' | 'error',
        detail?: string
    ): void;
    public static show(
        message: null,
        type: 'information' | 'warning' | 'error',
        detail: string
    ): void;
    public static show(
        message: string | null,
        type: 'information' | 'warning' | 'error',
        detail: string | null = null
    ): void {
        const level = {
            information: 'Info ',
            warning: 'Warn ',
            error: 'Error'
        }[type];
        const priority = {
            information: 0,
            warning: 1,
            error: 2
        };
        if (priority[type] < priority[logLevel()]) {
            return;
        }
        const method = {
            information: 'showInformationMessage',
            warning: 'showWarningMessage',
            error: 'showErrorMessage'
        }[type] as 'showInformationMessage' | 'showWarningMessage' | 'showErrorMessage';
        this.channel.append(`[${level} - ${new Date().toLocaleString()}]`);
        message && this.channel.append(` ${message}`);
        this.channel.appendLine('');
        detail && this.channel.appendLine(detail);
        this.channel.appendLine('');
        message && showNotification() &&
            window[method](message, ...(detail ? ['OK', 'More...'] : ['OK'])).then((action) => {
                'More...' === action && this.channel.show();
            });
    }
}
