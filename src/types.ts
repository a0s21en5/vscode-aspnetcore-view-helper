import * as vscode from 'vscode';

export interface ModelProperty {
	name: string;
	type: string;
	isPrimaryKey: boolean;
	isRequired: boolean;
	attributes: string[];
	inputType?: string;
}

export interface ControllerInfo {
	controllerName: string;
	actionName: string;
}

export interface TemplateData {
	actionName: string;
	controllerName: string;
	model?: string;
	modelName: string;
	layoutPage?: string | null;
	properties: ModelProperty[];
	primaryKeyProperty?: string;
}

export interface ViewGenerationOptions {
	workspacePath: string;
	controllerName: string;
	actionName: string;
	templateType: string;
	modelType?: string;
	layoutPage?: string | null;
}