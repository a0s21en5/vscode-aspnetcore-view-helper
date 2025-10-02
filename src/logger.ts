import * as vscode from 'vscode';
import { Logger } from './types';

/**
 * Output channel for extension logging
 */
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Creates and configures the logger
 */
export function createLogger(extensionName: string): Logger {
	outputChannel ??= vscode.window.createOutputChannel(extensionName);

	return {
		debug(message: string, ...args: unknown[]): void {
			const config = vscode.workspace.getConfiguration('vscode-aspnetcore-view-helper');
			if (config.get<boolean>('enableLogging', false)) {
				const formattedMessage = formatLogMessage('DEBUG', message, ...args);
				outputChannel?.appendLine(formattedMessage);
			}
		},

		info(message: string, ...args: unknown[]): void {
			const formattedMessage = formatLogMessage('INFO', message, ...args);
			outputChannel?.appendLine(formattedMessage);
		},

		warn(message: string, ...args: unknown[]): void {
			const formattedMessage = formatLogMessage('WARN', message, ...args);
			outputChannel?.appendLine(formattedMessage);
		},

		error(message: string, error?: Error, ...args: unknown[]): void {
			const formattedMessage = formatLogMessage('ERROR', message, ...args);
			outputChannel?.appendLine(formattedMessage);
			
			if (error) {
				outputChannel?.appendLine(`Error details: ${error.message}`);
				if (error.stack) {
					outputChannel?.appendLine(`Stack trace: ${error.stack}`);
				}
			}
		}
	};
}

/**
 * Formats a log message with timestamp and level
 */
function formatLogMessage(level: string, message: string, ...args: unknown[]): string {
	const timestamp = new Date().toISOString();
	const formattedArgs = args.length > 0 ? ` | Args: ${args.map(arg => JSON.stringify(arg)).join(', ')}` : '';
	return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
}

/**
 * Disposes the output channel
 */
export function disposeLogger(): void {
	outputChannel?.dispose();
	outputChannel = undefined;
}