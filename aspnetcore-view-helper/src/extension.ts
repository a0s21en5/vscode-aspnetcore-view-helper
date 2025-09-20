import * as vscode from 'vscode';
import * as Handlebars from 'handlebars';
import { detectControllerInfo, findAndOpenModelFile } from './controllerUtils';
import { generateViewFile, generateDefaultMvcTemplates } from './templateGenerator';
import { ViewGenerationOptions } from './types';

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('ASP.NET Core View Helper extension is now active!');

	// Register Handlebars helpers
	registerHandlebarsHelpers();

	// Register all extension commands
	registerCommands(context);
}

/**
 * Extension deactivation cleanup
 */
export function deactivate() {
	// Cleanup if needed
}

/**
 * Register Handlebars helper functions
 */
function registerHandlebarsHelpers() {
	Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
}

/**
 * Register VS Code commands for the extension
 */
function registerCommands(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('aspnetcore-view-helper.generateView', generateView),
		vscode.commands.registerCommand('aspnetcore-view-helper.scaffoldCRUD', scaffoldCRUD),
		vscode.commands.registerCommand('aspnetcore-view-helper.generateDefaultTemplates', generateDefaultTemplates),
		vscode.commands.registerCommand('aspnetcore-view-helper.goToModelDefinition', goToModelDefinition)
	);
}

/**
 * Generate a single view from controller method
 */
async function generateView() {
	try {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// Validate file type
		if (!editor.document.fileName.endsWith('.cs')) {
			vscode.window.showErrorMessage('Please open a C# controller file');
			return;
		}

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		// Detect controller and action information
		const controllerInfo = await detectControllerInfo(editor.document, editor.selection);
		if (!controllerInfo) {
			vscode.window.showErrorMessage('Could not detect controller or action method');
			return;
		}

		// Get user input for view generation
		const templateType = await showTemplateSelection();
		if (!templateType) {
			return;
		}

		const modelType = await getModelTypeInput();
		const layoutPage = await getLayoutPageInput();

		// Generate the view
		const options: ViewGenerationOptions = {
			workspacePath: workspaceFolder.uri.fsPath,
			controllerName: controllerInfo.controllerName,
			actionName: controllerInfo.actionName,
			templateType: templateType.toLowerCase(),
			modelType,
			layoutPage
		};

		await generateViewFile(options);
		vscode.window.showInformationMessage(`View ${controllerInfo.actionName}.cshtml created successfully!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating view: ${error}`);
	}
}

/**
 * Scaffold complete CRUD views for a model
 */
async function scaffoldCRUD() {
	try {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		// Get user input
		const modelType = await vscode.window.showInputBox({
			prompt: 'Enter model type for CRUD scaffolding',
			placeHolder: 'e.g. MyApp.Models.Product'
		});

		if (!modelType) {
			return;
		}

		const modelName = modelType.split('.').pop() || modelType;
		const controllerName = await vscode.window.showInputBox({
			prompt: 'Enter controller name',
			value: `${modelName}s`
		});

		if (!controllerName) {
			return;
		}

		const layoutPage = await getLayoutPageInput();

		// Generate all CRUD views
		const crudActions = ['index', 'create', 'edit', 'details', 'delete'];
		
		for (const action of crudActions) {
			const options: ViewGenerationOptions = {
				workspacePath: workspaceFolder.uri.fsPath,
				controllerName,
				actionName: action.charAt(0).toUpperCase() + action.slice(1),
				templateType: action,
				modelType,
				layoutPage
			};

			await generateViewFile(options);
		}

		vscode.window.showInformationMessage(`CRUD views for ${modelName} created successfully!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating CRUD views: ${error}`);
	}
}

/**
 * Generate default MVC templates
 */
async function generateDefaultTemplates() {
	try {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		await generateDefaultMvcTemplates(workspaceFolder.uri.fsPath);
		vscode.window.showInformationMessage('Default MVC templates created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating default templates: ${error}`);
	}
}

/**
 * Navigate to model definition from view
 */
async function goToModelDefinition() {
	try {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		// Validate file type
		if (!editor.document.fileName.endsWith('.cshtml')) {
			vscode.window.showErrorMessage('Please open a Razor view file');
			return;
		}

		const position = editor.selection.active;
		const line = editor.document.lineAt(position.line);
		const lineText = line.text;

		// Look for @model directive
		const modelMatch = lineText.match(/@model\s+([^\s<]+)/);
		if (!modelMatch) {
			vscode.window.showErrorMessage('No @model directive found on current line');
			return;
		}

		const modelType = modelMatch[1];
		await findAndOpenModelFile(modelType);
	} catch (error) {
		vscode.window.showErrorMessage(`Could not find model file: ${error}`);
	}
}

/**
 * Show template selection dialog
 */
async function showTemplateSelection(): Promise<string | undefined> {
	const templateOptions = ['Empty', 'Index', 'Create', 'Edit', 'Details', 'Delete'];
	return await vscode.window.showQuickPick(templateOptions, {
		placeHolder: 'Select view template'
	});
}

/**
 * Get model type input from user
 */
async function getModelTypeInput(): Promise<string | undefined> {
	return await vscode.window.showInputBox({
		prompt: 'Enter model type (optional)',
		placeHolder: 'e.g. MyApp.Models.Product'
	});
}

/**
 * Get layout page input from user
 */
async function getLayoutPageInput(): Promise<string | null> {
	const useLayout = await vscode.window.showQuickPick(['Yes', 'No'], {
		placeHolder: 'Use layout page?'
	});

	if (useLayout === 'Yes') {
		const layoutPage = await vscode.window.showInputBox({
			prompt: 'Enter layout page',
			value: '_Layout'
		});
		return layoutPage || '_Layout';
	}

	return null;
}