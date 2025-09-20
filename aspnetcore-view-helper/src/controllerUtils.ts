import * as vscode from 'vscode';
import * as path from 'path';
import { ControllerInfo } from './types';

/**
 * Detects controller and action information from the active editor
 */
export async function detectControllerInfo(document: vscode.TextDocument, selection: vscode.Selection): Promise<ControllerInfo | null> {
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

/**
 * Finds and opens a model file based on model type
 */
export async function findAndOpenModelFile(modelType: string): Promise<void> {
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