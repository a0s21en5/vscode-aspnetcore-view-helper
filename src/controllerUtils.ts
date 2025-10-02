import * as vscode from 'vscode';
import * as path from 'path';
import { ControllerInfo, ControllerParameter } from './types';

/**
 * Regular expressions for parsing C# controller code
 */
const CONTROLLER_CLASS_REGEX = /class\s+(\w+Controller)\s*(?::\s*[\w<>,\s]+)?\s*\{/;
const ACTION_METHOD_REGEX = /(?:public|internal|protected)?\s*(?:async\s+)?(?:Task<)?(?:IActionResult|ActionResult|ViewResult|JsonResult|ContentResult|RedirectResult|PartialViewResult)>?\s+(\w+)\s*\([^)]*\)/g;

/**
 * Detects controller and action information from the active editor
 */
export async function detectControllerInfo(
	document: vscode.TextDocument, 
	selection: vscode.Selection
): Promise<ControllerInfo | null> {
	const text = document.getText();
	
	// Extract controller name from file path or class declaration
	const fileName = path.basename(document.fileName, '.cs');
	let controllerName = fileName.replace(/Controller$/, '');
	let namespace: string | undefined;
	
	// Try to find class declaration for better controller name detection
	const classMatch = text.match(CONTROLLER_CLASS_REGEX);
	if (classMatch?.[1]) {
		controllerName = classMatch[1].replace(/Controller$/, '');
	}

	// Extract namespace
	const namespaceMatch = text.match(/namespace\s+([\w.]+)/);
	if (namespaceMatch?.[1]) {
		namespace = namespaceMatch[1];
	}

	// Find action method at cursor position
	const currentPosition = document.offsetAt(selection.active);
	
	// Look for action methods and find the closest one to cursor
	const methodMatches = Array.from(text.matchAll(ACTION_METHOD_REGEX));
	
	let actionName = 'Index'; // Default
	let returnType: string | undefined;
	let parameters: readonly ControllerParameter[] = [];
	let closestDistance = Infinity;

	for (const match of methodMatches) {
		if (match.index !== undefined && match[1]) {
			const distance = Math.abs(match.index - currentPosition);
			if (distance < closestDistance) {
				closestDistance = distance;
				actionName = match[1];
				
				// Extract return type and parameters from the full match
				const fullMethodMatch = text.substring(match.index, match.index + match[0].length);
				returnType = extractReturnType(fullMethodMatch);
				parameters = extractParameters(fullMethodMatch);
			}
		}
	}

	return { 
		controllerName, 
		actionName, 
		...(namespace && { namespace }),
		...(returnType && { returnType }),
		...(parameters.length > 0 && { parameters })
	};
}

/**
 * Extracts the return type from a method signature
 */
function extractReturnType(methodSignature: string): string | undefined {
	const returnTypeMatch = methodSignature.match(/(?:public|internal|protected)?\s*(?:async\s+)?((?:Task<)?(?:IActionResult|ActionResult|ViewResult|JsonResult|ContentResult|RedirectResult|PartialViewResult)>?)/);
	return returnTypeMatch?.[1];
}

/**
 * Extracts parameters from a method signature
 */
function extractParameters(methodSignature: string): ControllerParameter[] {
	const parametersMatch = methodSignature.match(/\(([^)]*)\)/);
	if (!parametersMatch?.[1]?.trim()) {
		return [];
	}

	const parametersString = parametersMatch[1];
	const parameters: ControllerParameter[] = [];
	
	// Split by comma, but handle generic types and default values
	const parameterParts = splitParameters(parametersString);
	
	for (const part of parameterParts) {
		const trimmed = part.trim();
		if (!trimmed) {
			continue;
		}

		const paramMatch = trimmed.match(/(\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)(?:\s*=\s*([^,]+))?/);
		if (paramMatch?.[1] && paramMatch?.[2]) {
			parameters.push({
				name: paramMatch[2],
				type: paramMatch[1],
				isOptional: !!paramMatch[3],
				...(paramMatch[3] && { defaultValue: paramMatch[3].trim() })
			});
		}
	}

	return parameters;
}

/**
 * Splits parameter string while respecting generic types and nested brackets
 */
function splitParameters(parametersString: string): string[] {
	const parameters: string[] = [];
	let current = '';
	let depth = 0;
	let inString = false;
	let stringChar = '';

	for (let i = 0; i < parametersString.length; i++) {
		const char = parametersString[i];
		
		if (!inString) {
			if (char === '"' || char === "'") {
				inString = true;
				stringChar = char;
			} else if (char === '<' || char === '[' || char === '(') {
				depth++;
			} else if (char === '>' || char === ']' || char === ')') {
				depth--;
			} else if (char === ',' && depth === 0) {
				parameters.push(current.trim());
				current = '';
				continue;
			}
		} else if (char === stringChar && parametersString[i - 1] !== '\\') {
			inString = false;
		}

		current += char;
	}

	if (current.trim()) {
		parameters.push(current.trim());
	}

	return parameters;
}

/**
 * Finds and opens a model file based on model type
 */
export async function findAndOpenModelFile(modelType: string): Promise<void> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		throw new Error('No workspace folder found');
	}

	// Extract class name from full type
	const className = modelType.split('.').pop();
	if (!className) {
		throw new Error('Invalid model type');
	}

	// Search for the model file with multiple possible patterns
	const searchPatterns = [
		`**/${className}.cs`,
		`**/Models/${className}.cs`,
		`**/Models/**/${className}.cs`,
		`**/*Models*/${className}.cs`
	];

	let files: vscode.Uri[] = [];
	
	for (const pattern of searchPatterns) {
		files = await vscode.workspace.findFiles(pattern, '**/bin/**,**/obj/**');
		if (files.length > 0) {
			break;
		}
	}

	if (files.length === 0) {
		throw new Error(`Model file ${className}.cs not found in workspace`);
	}

	// If multiple files found, prefer the one in Models folder
	const modelFile = files.length === 1 
		? files[0] 
		: files.find(file => file.fsPath.includes('Models')) ?? files[0];

	if (!modelFile) {
		throw new Error(`Could not determine model file to open`);
	}

	// Open the file
	const document = await vscode.workspace.openTextDocument(modelFile);
	const editor = await vscode.window.showTextDocument(document);

	// Try to find the class declaration and position cursor there
	const text = document.getText();
	const classRegex = new RegExp(`(?:public\\s+)?(?:partial\\s+)?class\\s+${className}(?:\\s*:\\s*[\\w<>,\\s]+)?\\s*\\{`, 'i');
	const classMatch = text.match(classRegex);
	
	if (classMatch?.index !== undefined) {
		const position = document.positionAt(classMatch.index);
		editor.selection = new vscode.Selection(position, position);
		editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
	}
}