import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModelProperty } from './types';

/**
 * Parses C# model files to extract properties and their metadata
 */
export async function parseModelProperties(modelType: string, projectRoot: string): Promise<ModelProperty[]> {
	if (!modelType) {
		return [];
	}

	// Extract class name from full type
	const className = modelType.split('.').pop();
	if (!className) {
		return [];
	}

	try {
		// Search for the model file
		const pattern = `**/${className}.cs`;
		const files = await vscode.workspace.findFiles(pattern, '**/bin/**,**/obj/**');

		if (files.length === 0) {
			console.log(`Model file ${className}.cs not found`);
			return [];
		}

		// Read the model file
		const modelFile = files[0];
		const content = fs.readFileSync(modelFile.fsPath, 'utf8');

		return extractPropertiesFromContent(content, className);
	} catch (error) {
		console.error(`Error parsing model ${modelType}:`, error);
		return [];
	}
}

/**
 * Extracts properties from C# class content
 */
function extractPropertiesFromContent(content: string, className: string): ModelProperty[] {
	// Find the class definition
	const classRegex = new RegExp(`class\\s+${className}[^{]*\\{([^}]*)\\}`, 's');
	const classMatch = content.match(classRegex);
	
	if (!classMatch) {
		// Try to find partial class or interface
		const partialClassRegex = new RegExp(`(?:partial\\s+)?class\\s+${className}[^{]*\\{`, 's');
		const partialMatch = content.match(partialClassRegex);
		if (partialMatch) {
			// For partial classes, we need to parse the entire content
			return parsePropertiesFromFullContent(content);
		}
		return [];
	}

	return parsePropertiesFromFullContent(content);
}

/**
 * Parses C# content line by line to extract property declarations
 */
function parsePropertiesFromFullContent(content: string): ModelProperty[] {
	const properties: ModelProperty[] = [];
	
	// Remove comments and string literals to avoid false matches
	const cleanContent = content
		.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
		.replace(/\/\/.*$/gm, '') // Remove line comments
		.replace(/"[^"]*"/g, '""') // Remove string literals
		.replace(/'[^']*'/g, "''"); // Remove char literals

	// Split into lines for better processing
	const lines = cleanContent.split('\n');
	let currentAttributes: string[] = [];
	let collectingAttributes = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		
		// Skip empty lines and using statements
		if (!line || line.startsWith('using ') || line.startsWith('namespace ')) {
			continue;
		}

		// Check for attributes
		const attributeMatch = line.match(/^\[([^\]]*)\]$/);
		if (attributeMatch) {
			currentAttributes.push(attributeMatch[1]);
			collectingAttributes = true;
			continue;
		}

		// Check for property declaration
		const propertyMatch = line.match(/^(?:public|internal|protected|private)?\s*(?:virtual\s+|override\s+|static\s+)?([A-Za-z_][A-Za-z0-9_<>?,\s]*\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{[^}]*\}/);
		
		if (propertyMatch) {
			const type = propertyMatch[1].trim();
			const name = propertyMatch[2].trim();
			
			// Determine if it's a primary key
			const isPrimaryKey = 
				name.toLowerCase() === 'id' ||
				name.toLowerCase().endsWith('id') ||
				currentAttributes.some(attr => attr.toLowerCase().includes('key'));
			
			// Determine if it's required
			const isRequired = 
				!type.includes('?') ||
				currentAttributes.some(attr => attr.toLowerCase().includes('required'));

			properties.push({
				name,
				type: cleanupType(type),
				isPrimaryKey,
				isRequired,
				attributes: [...currentAttributes]
			});

			// Reset for next property
			currentAttributes = [];
			collectingAttributes = false;
		} else {
			// If we're not in a property declaration and we see other code, reset attributes
			if (!collectingAttributes && (line.includes('{') || line.includes('}') || line.includes(';'))) {
				currentAttributes = [];
				collectingAttributes = false;
			}
		}
	}

	return properties;
}

/**
 * Cleans up C# type names for better readability
 */
function cleanupType(type: string): string {
	return type
		.replace(/\s+/g, ' ')
		.replace(/\?\s*$/, '') // Remove nullable marker
		.replace(/^(System\.)?/, '') // Remove System. prefix
		.trim();
}

/**
 * Determines appropriate HTML input type based on C# property type and attributes
 */
export function getInputTypeForProperty(property: ModelProperty): string {
	const type = property.type.toLowerCase();
	const attributes = property.attributes.map(attr => attr.toLowerCase());
	
	// Check attributes first for specific input types
	if (attributes.some(attr => attr.includes('email'))) {
		return 'email';
	}
	if (attributes.some(attr => attr.includes('phone'))) {
		return 'tel';
	}
	if (attributes.some(attr => attr.includes('password'))) {
		return 'password';
	}
	if (attributes.some(attr => attr.includes('url'))) {
		return 'url';
	}
	if (attributes.some(attr => attr.includes('color'))) {
		return 'color';
	}
	
	// Check type-based mappings
	if (type.includes('datetime')) {
		return 'datetime-local';
	} else if (type.includes('date') && !type.includes('datetime')) {
		return 'date';
	} else if (type.includes('time')) {
		return 'time';
	} else if (type.includes('bool')) {
		return 'checkbox';
	} else if (type.includes('int') || type.includes('long') || type.includes('short') || type.includes('byte')) {
		return 'number';
	} else if (type.includes('decimal') || type.includes('double') || type.includes('float')) {
		return 'number';
	} else if (type.includes('guid')) {
		return 'text';
	} else {
		return 'text';
	}
}