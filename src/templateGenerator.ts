import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ViewGenerationOptions, TemplateData } from './types';
import { findProjectRoot, detectProjectName } from './projectUtils';
import { parseModelProperties, getInputTypeForProperty } from './modelParser';

/**
 * Generates a view file based on the provided options
 */
export async function generateViewFile(options: ViewGenerationOptions): Promise<void> {
	const { workspacePath, controllerName, actionName, templateType, modelType, layoutPage } = options;

	// Find the actual project root (where .csproj is located)
	const projectRoot = await findProjectRoot(workspacePath);
	
	// Create Views/{Controller} directory within the project
	const viewsPath = path.join(projectRoot, 'Views', controllerName);
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

	// Parse model properties if model type is provided
	const modelProperties = modelType 
		? await parseModelProperties(modelType, projectRoot)
		: [] as const;

	// Prepare template data
	const templateData: TemplateData = {
		actionName,
		controllerName,
		model: modelType ?? '',
		modelName: modelType ? modelType.split('.').pop() ?? '' : '',
		layoutPage: layoutPage ?? null,
		properties: modelProperties.map(prop => ({
			...prop,
			inputType: getInputTypeForProperty(prop)
		})),
		primaryKeyProperty: modelProperties.find(prop => prop.isPrimaryKey)?.name ?? undefined
	};

	// Generate content
	const content = template(templateData);

	// Write file
	const filePath = path.join(viewsPath, `${actionName}.cshtml`);
	fs.writeFileSync(filePath, content);

	// Open the generated file
	const document = await vscode.workspace.openTextDocument(filePath);
	await vscode.window.showTextDocument(document);
}

/**
 * Generates default MVC templates (ViewStart, ViewImports, Layout, Error)
 */
export async function generateDefaultMvcTemplates(workspacePath: string): Promise<void> {
	// Find the actual project root
	const projectRoot = await findProjectRoot(workspacePath);
	
	// Detect project name
	const projectName = await detectProjectName(projectRoot);

	// Create Views folder structure within the project
	const viewsPath = path.join(projectRoot, 'Views');
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
}