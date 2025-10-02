import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Finds the actual project root by locating .csproj files
 */
export async function findProjectRoot(workspacePath: string): Promise<string> {
	// First, try to find .csproj in the workspace root
	try {
		const files = fs.readdirSync(workspacePath);
		const csprojFile = files.find(file => file.endsWith('.csproj'));
		
		if (csprojFile) {
			return workspacePath;
		}
	} catch {
		// Skip if we can't read the workspace directory
	}

	// If not found in root, search subdirectories for .csproj files
	try {
		const subdirs = fs.readdirSync(workspacePath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const subdir of subdirs) {
			const subdirPath = path.join(workspacePath, subdir);
			try {
				const subdirFiles = fs.readdirSync(subdirPath);
				const subdirCsproj = subdirFiles.find(file => file.endsWith('.csproj'));
				
				if (subdirCsproj) {
					return subdirPath;
				}
			} catch {
				// Skip directories we can't read
				continue;
			}
		}
	} catch {
		// If we can't read the workspace directory, fall back to workspace path
	}

	// Check if the current active file is in a project subdirectory
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const currentFilePath = path.dirname(editor.document.uri.fsPath);
		let currentDir = currentFilePath;
		
		// Walk up the directory tree to find a .csproj file
		while (currentDir !== workspacePath && currentDir !== path.dirname(currentDir)) {
			try {
				const files = fs.readdirSync(currentDir);
				const csprojFile = files.find(file => file.endsWith('.csproj'));
				
				if (csprojFile) {
					return currentDir;
				}
			} catch {
				// Skip directories we can't read
			}
			
			currentDir = path.dirname(currentDir);
		}
	}

	// Fallback to workspace path if no .csproj found
	return workspacePath;
}

/**
 * Detects the project name from .csproj file
 */
export async function detectProjectName(projectRoot: string): Promise<string> {
	try {
		const files = fs.readdirSync(projectRoot);
		const csprojFile = files.find(file => file.endsWith('.csproj'));
		
		if (csprojFile) {
			return path.basename(csprojFile, '.csproj');
		}
	} catch {
		// Fall back to directory name
	}

	return path.basename(projectRoot);
}