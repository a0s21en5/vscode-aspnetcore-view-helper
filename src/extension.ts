import * as vscode from 'vscode';
import * as Handlebars from 'handlebars';
import { detectControllerInfo, findAndOpenModelFile } from './controllerUtils';
import { generateViewFile, generateDefaultMvcTemplates } from './templateGenerator';
import { ViewGenerationOptions, TemplateType, Logger } from './types';
import { createLogger, disposeLogger } from './logger';
import { getConfiguration, onConfigurationChange } from './configuration';
import { createErrorHandler, ErrorHandler } from './errorHandler';
import { modelCache } from './cache';

// Extension globals
let logger: Logger;
let errorHandler: ErrorHandler;
let configurationWatcher: vscode.Disposable | undefined;

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext): void {
	// Initialize logging
	logger = createLogger('ASP.NET Core View Helper');
	errorHandler = createErrorHandler(logger);
	
	logger.info('ASP.NET Core View Helper extension is activating...');

	try {
		// Register Handlebars helpers
		registerHandlebarsHelpers();

		// Watch for configuration changes
		configurationWatcher = onConfigurationChange((config) => {
			logger.info('Configuration updated', config);
		});

		// Register all extension commands
		registerCommands(context);

		// Add configuration watcher to subscriptions
		if (configurationWatcher) {
			context.subscriptions.push(configurationWatcher);
		}

		logger.info('ASP.NET Core View Helper extension activated successfully');
	} catch (error) {
		errorHandler.handleError(error as Error, 'Extension activation');
	}
}

/**
 * Extension deactivation cleanup
 */
export function deactivate(): void {
	logger?.info('ASP.NET Core View Helper extension is deactivating...');
	
	// Clean up resources
	modelCache.clear();
	configurationWatcher?.dispose();
	disposeLogger();
}

/**
 * Register Handlebars helper functions
 */
function registerHandlebarsHelpers(): void {
	// Equality helper
	Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
	
	// Not equality helper
	Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
	
	// Greater than helper
	Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
	
	// Less than helper
	Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
	
	// String case helpers
	Handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase() ?? '');
	Handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase() ?? '');
	Handlebars.registerHelper('capitalize', (str: string) => {
		if (!str) {
			return '';
		}
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	
	// Pluralization helper
	Handlebars.registerHelper('pluralize', (str: string) => {
		if (!str) {
			return '';
		}
		if (str.endsWith('y')) {
			return `${str.slice(0, -1)}ies`;
		}
		if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch') || str.endsWith('x') || str.endsWith('z')) {
			return `${str}es`;
		}
		return `${str}s`;
	});

	// Array helpers
	Handlebars.registerHelper('length', (array: unknown[]) => array?.length ?? 0);
	Handlebars.registerHelper('first', (array: unknown[]) => array?.[0]);
	Handlebars.registerHelper('last', (array: unknown[]) => array?.[array.length - 1]);

	logger.debug('Handlebars helpers registered successfully');
}

/**
 * Register VS Code commands for the extension
 */
function registerCommands(context: vscode.ExtensionContext): void {
	const commands = [
		vscode.commands.registerCommand(
			'vscode-aspnetcore-view-helper.generateView', 
			errorHandler.wrap(generateView, 'Generate View')
		),
		vscode.commands.registerCommand(
			'vscode-aspnetcore-view-helper.scaffoldCRUD', 
			errorHandler.wrap(scaffoldCRUD, 'Scaffold CRUD')
		),
		vscode.commands.registerCommand(
			'vscode-aspnetcore-view-helper.generateDefaultTemplates', 
			errorHandler.wrap(generateDefaultTemplates, 'Generate Default Templates')
		),
		vscode.commands.registerCommand(
			'vscode-aspnetcore-view-helper.goToModelDefinition', 
			errorHandler.wrap(goToModelDefinition, 'Go to Model Definition')
		)
	];

	context.subscriptions.push(...commands);
	logger.debug('Extension commands registered successfully');
}

/**
 * Generate a single view from controller method
 */
async function generateView(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		throw new Error('No active editor found');
	}

	// Validate file type
	if (!editor.document.fileName.endsWith('.cs')) {
		throw new Error('Please open a C# controller file');
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
	if (!workspaceFolder) {
		throw new Error('No workspace folder found');
	}

	logger.debug('Detecting controller info from active editor');

	// Detect controller and action information
	const controllerInfo = await detectControllerInfo(editor.document, editor.selection);
	if (!controllerInfo) {
		throw new Error('Could not detect controller or action method');
	}

	logger.debug('Controller info detected', { controllerInfo });

	// Get user input for view generation
	const templateType = await showTemplateSelection();
	if (!templateType) {
		return; // User cancelled
	}

	const config = getConfiguration();
	const modelType = await getModelTypeInput();
	const layoutPage = await getLayoutPageInput(config);

	// Generate the view
	const options: ViewGenerationOptions = {
		workspacePath: workspaceFolder.uri.fsPath,
		controllerName: controllerInfo.controllerName,
		actionName: controllerInfo.actionName,
		templateType: templateType.toLowerCase(),
		...(modelType && { modelType }),
		layoutPage,
		openAfterGeneration: true
	};

	logger.debug('Generating view with options', { options });

	await generateViewFile(options);
	
	const message = `View ${controllerInfo.actionName}.cshtml created successfully!`;
	logger.info(message);
	vscode.window.showInformationMessage(message);
}

/**
 * Scaffold complete CRUD views for a model
 */
async function scaffoldCRUD(): Promise<void> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		throw new Error('No workspace folder found');
	}

	// Get user input
	const modelType = await vscode.window.showInputBox({
		prompt: 'Enter model type for CRUD scaffolding',
		placeHolder: 'e.g. MyApp.Models.Product',
		validateInput: (value) => {
			if (!value?.trim()) {
				return 'Model type is required';
			}
			return null;
		}
	});

	if (!modelType) {
		return; // User cancelled
	}

	const modelName = modelType.split('.').pop() ?? modelType;
	const controllerName = await vscode.window.showInputBox({
		prompt: 'Enter controller name',
		value: `${modelName}s`,
		validateInput: (value) => {
			if (!value?.trim()) {
				return 'Controller name is required';
			}
			return null;
		}
	});

	if (!controllerName) {
		return; // User cancelled
	}

	const config = getConfiguration();
	const layoutPage = await getLayoutPageInput(config);

	logger.debug('Scaffolding CRUD views', { modelType, controllerName });

	// Generate all CRUD views
	const crudActions: TemplateType[] = ['index', 'create', 'edit', 'details', 'delete'];
	const results: string[] = [];
	
	for (const action of crudActions) {
		const options: ViewGenerationOptions = {
			workspacePath: workspaceFolder.uri.fsPath,
			controllerName,
			actionName: action.charAt(0).toUpperCase() + action.slice(1),
			templateType: action,
			modelType,
			layoutPage,
			openAfterGeneration: false
		};

		await generateViewFile(options);
		results.push(`${options.actionName}.cshtml`);
	}

	const message = `CRUD views for ${modelName} created successfully: ${results.join(', ')}`;
	logger.info(message);
	vscode.window.showInformationMessage(message);
}

/**
 * Generate default MVC templates
 */
async function generateDefaultTemplates(): Promise<void> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		throw new Error('No workspace folder found');
	}

	logger.debug('Generating default MVC templates');

	await generateDefaultMvcTemplates(workspaceFolder.uri.fsPath);
	
	const message = 'Default MVC templates created successfully!';
	logger.info(message);
	vscode.window.showInformationMessage(message);
}

/**
 * Navigate to model definition from view
 */
async function goToModelDefinition(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		throw new Error('No active editor found');
	}

	// Validate file type
	if (!editor.document.fileName.endsWith('.cshtml')) {
		throw new Error('Please open a Razor view file');
	}

	const position = editor.selection.active;
	const line = editor.document.lineAt(position.line);
	const lineText = line.text;

	// Look for @model directive
	const modelMatch = lineText.match(/@model\s+([^\s<]+)/);
	if (!modelMatch) {
		throw new Error('No @model directive found on current line');
	}

	const modelType = modelMatch[1];
	if (!modelType) {
		throw new Error('Model type could not be extracted');
	}
	
	logger.debug('Navigating to model definition', { modelType });

	await findAndOpenModelFile(modelType);
}

/**
 * Show template selection dialog
 */
async function showTemplateSelection(): Promise<string | undefined> {
	const templateOptions: Array<{ label: string; description: string; value: TemplateType }> = [
		{ label: 'Empty', description: 'A minimal view template', value: 'empty' },
		{ label: 'Index', description: 'List view for displaying multiple items', value: 'index' },
		{ label: 'Create', description: 'Form for creating new items', value: 'create' },
		{ label: 'Edit', description: 'Form for editing existing items', value: 'edit' },
		{ label: 'Details', description: 'Read-only view for displaying item details', value: 'details' },
		{ label: 'Delete', description: 'Confirmation view for deleting items', value: 'delete' }
	];

	const selected = await vscode.window.showQuickPick(templateOptions, {
		placeHolder: 'Select view template',
		matchOnDescription: true
	});

	return selected?.value;
}

/**
 * Get model type input from user
 */
async function getModelTypeInput(): Promise<string | undefined> {
	return await vscode.window.showInputBox({
		prompt: 'Enter model type (optional)',
		placeHolder: 'e.g. MyApp.Models.Product',
		validateInput: (value) => {
			if (value && !value.trim()) {
				return 'Model type cannot be empty if provided';
			}
			return null;
		}
	});
}

/**
 * Get layout page input from user
 */
async function getLayoutPageInput(config: ReturnType<typeof getConfiguration>): Promise<string | null> {
	if (!config.useLayoutByDefault) {
		const useLayout = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: 'Use layout page?'
		});

		if (useLayout !== 'Yes') {
			return null;
		}
	}

	const layoutPage = await vscode.window.showInputBox({
		prompt: 'Enter layout page',
		value: config.defaultLayoutName,
		validateInput: (value) => {
			if (!value?.trim()) {
				return 'Layout page name is required';
			}
			return null;
		}
	});

	return layoutPage ?? config.defaultLayoutName;
}