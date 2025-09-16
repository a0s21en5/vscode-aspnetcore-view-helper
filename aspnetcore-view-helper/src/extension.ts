// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('ASP.NET Core View Helper extension is now active!');

	// Register all commands
	context.subscriptions.push(
		vscode.commands.registerCommand('aspnetcore-view-helper.generateView', generateView),
		vscode.commands.registerCommand('aspnetcore-view-helper.scaffoldCRUD', scaffoldCRUD),
		vscode.commands.registerCommand('aspnetcore-view-helper.generateDefaultTemplates', generateDefaultTemplates),
		vscode.commands.registerCommand('aspnetcore-view-helper.goToModelDefinition', goToModelDefinition)
	);
}

// Generate a single view from controller method
async function generateView() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found');
		return;
	}

	// Check if we're in a C# controller file
	if (!editor.document.fileName.endsWith('.cs')) {
		vscode.window.showErrorMessage('Please open a C# controller file');
		return;
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found');
		return;
	}

	// Get the current selection or word under cursor
	const selection = editor.selection;
	const wordRange = editor.document.getWordRangeAtPosition(selection.active);
	const selectedText = wordRange ? editor.document.getText(wordRange) : '';

	// Try to detect controller and action name
	const controllerInfo = await detectControllerInfo(editor.document, selection);
	if (!controllerInfo) {
		vscode.window.showErrorMessage('Could not detect controller or action method');
		return;
	}

	// Show template selection
	const templateOptions = ['Empty', 'Index', 'Create', 'Edit', 'Details', 'Delete'];
	const selectedTemplate = await vscode.window.showQuickPick(templateOptions, {
		placeHolder: 'Select view template'
	});

	if (!selectedTemplate) {
		return;
	}

	// Ask for model type
	const modelType = await vscode.window.showInputBox({
		prompt: 'Enter model type (optional)',
		placeHolder: 'e.g. MyApp.Models.Product'
	});

	// Ask for layout usage
	const useLayout = await vscode.window.showQuickPick(['Yes', 'No'], {
		placeHolder: 'Use layout page?'
	});

	const layoutPage = useLayout === 'Yes' ? await vscode.window.showInputBox({
		prompt: 'Enter layout page',
		value: '_Layout'
	}) : null;

	// Generate the view
	try {
		await generateViewFile(
			workspaceFolder.uri.fsPath,
			controllerInfo.controllerName,
			controllerInfo.actionName,
			selectedTemplate.toLowerCase(),
			modelType,
			layoutPage
		);
		vscode.window.showInformationMessage(`View ${controllerInfo.actionName}.cshtml created successfully!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating view: ${error}`);
	}
}

// Scaffold CRUD views for a model
async function scaffoldCRUD() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found');
		return;
	}

	// Ask for model type
	const modelType = await vscode.window.showInputBox({
		prompt: 'Enter model type for CRUD scaffolding',
		placeHolder: 'e.g. MyApp.Models.Product'
	});

	if (!modelType) {
		return;
	}

	// Extract model name from full type
	const modelName = modelType.split('.').pop() || modelType;

	// Ask for controller name
	const controllerName = await vscode.window.showInputBox({
		prompt: 'Enter controller name',
		value: `${modelName}s`
	});

	if (!controllerName) {
		return;
	}

	// Ask for layout usage
	const useLayout = await vscode.window.showQuickPick(['Yes', 'No'], {
		placeHolder: 'Use layout page?'
	});

	const layoutPage = useLayout === 'Yes' ? '_Layout' : null;

	try {
		// Generate all CRUD views
		const crudActions = ['index', 'create', 'edit', 'details', 'delete'];
		for (const action of crudActions) {
			await generateViewFile(
				workspaceFolder.uri.fsPath,
				controllerName,
				action.charAt(0).toUpperCase() + action.slice(1),
				action,
				modelType,
				layoutPage
			);
		}
		vscode.window.showInformationMessage(`CRUD views for ${modelName} created successfully!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating CRUD views: ${error}`);
	}
}

// Generate default MVC templates
async function generateDefaultTemplates() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found');
		return;
	}

	// Detect project name
	const projectName = await detectProjectName(workspaceFolder.uri.fsPath);

	try {
		// Create Views folder structure
		const viewsPath = path.join(workspaceFolder.uri.fsPath, 'Views');
		const sharedPath = path.join(viewsPath, 'Shared');
		
		if (!fs.existsSync(viewsPath)) {
			fs.mkdirSync(viewsPath, { recursive: true });
		}
		if (!fs.existsSync(sharedPath)) {
			fs.mkdirSync(sharedPath, { recursive: true });
		}

		// Generate _ViewStart.cshtml
		const viewStartContent = fs.readFileSync(
			path.join(__dirname, '..', 'templates', '_ViewStart.cshtml'), 
			'utf8'
		);
		fs.writeFileSync(path.join(viewsPath, '_ViewStart.cshtml'), viewStartContent);

		// Generate _ViewImports.cshtml
		const viewImportsTemplate = fs.readFileSync(
			path.join(__dirname, '..', 'templates', '_ViewImports.hbs'), 
			'utf8'
		);
		const viewImportsCompiled = Handlebars.compile(viewImportsTemplate);
		const viewImportsContent = viewImportsCompiled({ projectName });
		fs.writeFileSync(path.join(viewsPath, '_ViewImports.cshtml'), viewImportsContent);

		// Generate _Layout.cshtml
		const layoutTemplate = fs.readFileSync(
			path.join(__dirname, '..', 'templates', '_Layout.hbs'), 
			'utf8'
		);
		const layoutCompiled = Handlebars.compile(layoutTemplate);
		const layoutContent = layoutCompiled({ projectName });
		fs.writeFileSync(path.join(sharedPath, '_Layout.cshtml'), layoutContent);

		// Generate Error.cshtml
		const errorContent = fs.readFileSync(
			path.join(__dirname, '..', 'templates', 'Error.cshtml'), 
			'utf8'
		);
		fs.writeFileSync(path.join(sharedPath, 'Error.cshtml'), errorContent);

		vscode.window.showInformationMessage('Default MVC templates created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating default templates: ${error}`);
	}
}

// Go to model definition
async function goToModelDefinition() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found');
		return;
	}

	// Check if we're in a Razor view file
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
	
	// Try to find the model file
	try {
		await findAndOpenModelFile(modelType);
	} catch (error) {
		vscode.window.showErrorMessage(`Could not find model file for ${modelType}`);
	}
}

// Helper functions

async function detectControllerInfo(document: vscode.TextDocument, selection: vscode.Selection) {
	const text = document.getText();
	
	// Extract controller name from file path or class declaration
	const fileName = path.basename(document.fileName, '.cs');
	let controllerName = fileName.replace('Controller', '');
	
	// Try to find class declaration
	const classMatch = text.match(/class\s+(\w+Controller)/);
	if (classMatch) {
		controllerName = classMatch[1].replace('Controller', '');
	}

	// Find action method at cursor position
	const currentPosition = document.offsetAt(selection.active);
	const beforeCursor = text.substring(0, currentPosition);
	const afterCursor = text.substring(currentPosition);

	// Look for action methods (public methods that return ActionResult or similar)
	const methodMatches = text.matchAll(/public\s+(?:async\s+)?(?:Task<)?(?:IActionResult|ActionResult|ViewResult)>?\s+(\w+)\s*\(/g);
	
	let actionName = 'Index'; // Default
	let closestDistance = Infinity;

	for (const match of methodMatches) {
		if (match.index !== undefined) {
			const distance = Math.abs(match.index - currentPosition);
			if (distance < closestDistance) {
				closestDistance = distance;
				actionName = match[1];
			}
		}
	}

	return { controllerName, actionName };
}

async function generateViewFile(
	workspacePath: string,
	controllerName: string,
	actionName: string,
	templateType: string,
	modelType?: string,
	layoutPage?: string | null
) {
	// Create Views/{Controller} directory
	const viewsPath = path.join(workspacePath, 'Views', controllerName);
	if (!fs.existsSync(viewsPath)) {
		fs.mkdirSync(viewsPath, { recursive: true });
	}

	// Load template
	const templatePath = path.join(__dirname, '..', 'templates', `${templateType}.hbs`);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Template ${templateType} not found`);
	}

	const templateContent = fs.readFileSync(templatePath, 'utf8');
	const template = Handlebars.compile(templateContent);

	// Prepare template data
	const templateData: any = {
		actionName,
		controllerName,
		model: modelType,
		modelName: modelType ? modelType.split('.').pop() : '',
		layoutPage: layoutPage || null,
		properties: [] // This would need to be enhanced to detect actual model properties
	};

	// If we have a model type, try to detect properties (simplified for demo)
	if (modelType) {
		templateData.properties = ['Id', 'Name', 'Description']; // Placeholder
		templateData.primaryKeyProperty = 'Id';
	}

	// Generate content
	const content = template(templateData);

	// Write file
	const filePath = path.join(viewsPath, `${actionName}.cshtml`);
	fs.writeFileSync(filePath, content);

	// Open the generated file
	const document = await vscode.workspace.openTextDocument(filePath);
	await vscode.window.showTextDocument(document);
}

async function detectProjectName(workspacePath: string): Promise<string> {
	// Look for .csproj file
	const files = fs.readdirSync(workspacePath);
	const csprojFile = files.find(file => file.endsWith('.csproj'));
	
	if (csprojFile) {
		return path.basename(csprojFile, '.csproj');
	}

	// Fallback to workspace folder name
	return path.basename(workspacePath);
}

async function findAndOpenModelFile(modelType: string) {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		throw new Error('No workspace folder');
	}

	// Extract class name from full type
	const className = modelType.split('.').pop();
	if (!className) {
		throw new Error('Invalid model type');
	}

	// Search for the model file
	const pattern = `**/${className}.cs`;
	const files = await vscode.workspace.findFiles(pattern, '**/bin/**,**/obj/**');

	if (files.length === 0) {
		throw new Error(`Model file ${className}.cs not found`);
	}

	// Open the first match
	const document = await vscode.workspace.openTextDocument(files[0]);
	await vscode.window.showTextDocument(document);

	// Try to find the class declaration and position cursor there
	const text = document.getText();
	const classMatch = text.match(new RegExp(`class\\s+${className}`, 'i'));
	if (classMatch && classMatch.index !== undefined) {
		const position = document.positionAt(classMatch.index);
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(new vscode.Range(position, position));
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
