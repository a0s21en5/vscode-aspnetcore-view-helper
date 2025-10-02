import * as vscode from 'vscode';
import { ExtensionConfiguration } from './types';

/**
 * Gets the current extension configuration
 */
export function getConfiguration(): ExtensionConfiguration {
	const config = vscode.workspace.getConfiguration('aspnetcoreViewHelper');
	
	return {
		defaultTemplateDirectory: config.get<string>('defaultTemplateDirectory', 'Views'),
		useLayoutByDefault: config.get<boolean>('useLayoutByDefault', true),
		defaultLayoutName: config.get<string>('defaultLayoutName', '_Layout'),
		enableLogging: config.get<boolean>('enableLogging', false)
	};
}

/**
 * Watches for configuration changes and executes a callback
 */
export function onConfigurationChange(callback: (config: ExtensionConfiguration) => void): vscode.Disposable {
	return vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('aspnetcoreViewHelper')) {
			callback(getConfiguration());
		}
	});
}

/**
 * Updates a configuration value
 */
export async function updateConfiguration<T>(key: keyof ExtensionConfiguration, value: T, global = false): Promise<void> {
	const config = vscode.workspace.getConfiguration('aspnetcoreViewHelper');
	await config.update(key, value, global);
}