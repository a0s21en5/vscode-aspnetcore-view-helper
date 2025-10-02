import * as vscode from 'vscode';
import * as fs from 'fs';
import { ModelProperty } from './types';
import { modelCache } from './cache';

/**
 * Type mappings for C# types to HTML input types
 */
const TYPE_MAPPINGS = new Map<string, string>([
	// Date and time types
	['datetime', 'datetime-local'],
	['datetimeoffset', 'datetime-local'],
	['date', 'date'],
	['time', 'time'],
	['timespan', 'time'],
	
	// Numeric types
	['int', 'number'],
	['integer', 'number'],
	['long', 'number'],
	['short', 'number'],
	['byte', 'number'],
	['decimal', 'number'],
	['double', 'number'],
	['float', 'number'],
	
	// Boolean
	['bool', 'checkbox'],
	['boolean', 'checkbox'],
	
	// Text types (default to text, can be overridden by attributes)
	['string', 'text'],
	['char', 'text'],
	['guid', 'text'],
	['uuid', 'text']
]);

/**
 * Attribute-based input type mappings
 */
const ATTRIBUTE_MAPPINGS = new Map<string, string>([
	['email', 'email'],
	['phone', 'tel'],
	['password', 'password'],
	['url', 'url'],
	['color', 'color'],
	['range', 'range'],
	['file', 'file'],
	['hidden', 'hidden']
]);

/**
 * Parses C# model files to extract properties and their metadata
 */
export async function parseModelProperties(modelType: string, _projectRoot: string): Promise<readonly ModelProperty[]> {
	if (!modelType?.trim()) {
		return [];
	}

	// Check cache first
	const className = modelType.split('.').pop();
	if (!className) {
		return [];
	}

	try {
		// Search for the model file
		const files = await findModelFiles(className);
		if (files.length === 0) {
			// Use logger instead of console when available
			return [];
		}

		const modelFile = selectBestModelFile(files);
		
		// Check cache
		const cachedProperties = modelCache.get(modelType, modelFile.fsPath);
		if (cachedProperties) {
			return cachedProperties;
		}

		// Read and parse the model file
		const content = await fs.promises.readFile(modelFile.fsPath, 'utf8');
		const properties = extractPropertiesFromContent(content, className);

		// Cache the results
		modelCache.set(modelType, modelFile.fsPath, properties);

		return properties;
	} catch {
		// Use logger instead of console when available
		return [];
	}
}

/**
 * Finds model files using multiple search patterns
 */
async function findModelFiles(className: string): Promise<vscode.Uri[]> {
	const searchPatterns = [
		`**/${className}.cs`,
		`**/Models/${className}.cs`,
		`**/Models/**/${className}.cs`,
		`**/*Models*/${className}.cs`,
		`**/Entities/${className}.cs`,
		`**/Domain/${className}.cs`
	];

	for (const pattern of searchPatterns) {
		const files = await vscode.workspace.findFiles(pattern, '**/bin/**,**/obj/**,**/node_modules/**');
		if (files.length > 0) {
			return files;
		}
	}

	return [];
}

/**
 * Selects the best model file from multiple candidates
 */
function selectBestModelFile(files: vscode.Uri[]): vscode.Uri {
	if (files.length === 1) {
		const file = files[0];
		if (!file) {
			throw new Error('No model file found');
		}
		return file;
	}

	// Prefer files in Models, Entities, or Domain folders
	const preferredFolders = ['Models', 'Entities', 'Domain'];
	
	for (const folder of preferredFolders) {
		const preferred = files.find(file => file.fsPath.includes(folder));
		if (preferred) {
			return preferred;
		}
	}

	const defaultFile = files[0];
	if (!defaultFile) {
		throw new Error('No model file found');
	}
	return defaultFile;
}

/**
 * Extracts properties from C# class content
 */
function extractPropertiesFromContent(content: string, className: string): ModelProperty[] {
	// Remove comments and string literals to avoid false matches
	const cleanContent = cleanSourceCode(content);

	// Find the class definition - handle partial classes and inheritance
	const classRegex = new RegExp(
		`(?:public\\s+)?(?:partial\\s+)?class\\s+${className}(?:\\s*:\\s*[\\w<>,\\s]+)?\\s*\\{`,
		'i'
	);
	
	const classMatch = cleanContent.match(classRegex);
	if (!classMatch) {
		// Try parsing the entire content for partial classes
		return parsePropertiesFromContent(cleanContent);
	}

	return parsePropertiesFromContent(cleanContent);
}

/**
 * Removes comments and string literals from C# source code
 */
function cleanSourceCode(content: string): string {
	return content
		.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
		.replace(/\/\/.*$/gm, '') // Remove line comments
		.replace(/"(?:[^"\\]|\\.)*"/g, '""') // Remove string literals
		.replace(/'(?:[^'\\]|\\.)*'/g, "''") // Remove char literals
		.replace(/@"(?:[^"]|"")*"/g, '""'); // Remove verbatim strings
}

/**
 * Parses C# content to extract property declarations
 */
function parsePropertiesFromContent(content: string): ModelProperty[] {
	const properties: ModelProperty[] = [];
	const lines = content.split('\n');
	let currentAttributes: string[] = [];
	let isInClass = false;
	let braceLevel = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]?.trim();
		
		// Skip empty lines and using statements
		if (!line || line.startsWith('using ') || line.startsWith('namespace ')) {
			continue;
		}

		// Track brace levels to know if we're inside a class
		braceLevel += (line.match(/\{/g) ?? []).length;
		braceLevel -= (line.match(/\}/g) ?? []).length;

		// Detect class start
		if (!isInClass && line.includes('class ')) {
			isInClass = true;
			continue;
		}

		// Reset when exiting class
		if (isInClass && braceLevel === 0) {
			isInClass = false;
			continue;
		}

		if (!isInClass) {
			continue;
		}

		// Check for attributes
		const attributeMatch = line.match(/^\[([^\]]*)\]$/);
		if (attributeMatch?.[1]) {
			currentAttributes.push(attributeMatch[1]);
			continue;
		}

		// Check for property declaration
		const propertyMatch = line.match(
			/^(?:public|internal|protected|private)?\s*(?:virtual\s+|override\s+|static\s+)?([A-Za-z_][A-Za-z0-9_<>?,\s]*\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{[^}]*\}/
		);
		
		if (propertyMatch?.[1] && propertyMatch?.[2]) {
			const type = propertyMatch[1].trim();
			const name = propertyMatch[2].trim();
			
			// Skip compiler-generated or non-domain properties
			if (shouldSkipProperty(name, currentAttributes)) {
				currentAttributes = [];
				continue;
			}

			const property = createModelProperty(name, type, currentAttributes);
			properties.push(property);

			// Reset for next property
			currentAttributes = [];
		} else if (!line.includes('[') && !line.includes('{') && !line.includes('}')) {
			// If we encounter other code that's not an attribute, reset attributes
			currentAttributes = [];
		}
	}

	return properties;
}

/**
 * Determines if a property should be skipped during parsing
 */
function shouldSkipProperty(name: string, attributes: string[]): boolean {
	// Skip properties that are typically not user-editable
	const skipPatterns = [
		/^Id$/i,
		/CreatedAt$/i,
		/UpdatedAt$/i,
		/ModifiedAt$/i,
		/DeletedAt$/i,
		/Version$/i,
		/Timestamp$/i,
		/RowVersion$/i
	];

	// Skip if marked with NotMapped or other exclusion attributes
	const exclusionAttributes = ['NotMapped', 'Computed', 'DatabaseGenerated'];
	if (attributes.some(attr => exclusionAttributes.some(excl => attr.includes(excl)))) {
		return true;
	}

	return skipPatterns.some(pattern => pattern.test(name));
}

/**
 * Creates a ModelProperty object from parsed information
 */
function createModelProperty(name: string, type: string, attributes: string[]): ModelProperty {
	const cleanType = cleanupType(type);
	const isNullable = type.includes('?');
	
	// Determine if it's a primary key
	const isPrimaryKey = 
		name.toLowerCase() === 'id' ||
		name.toLowerCase().endsWith('id') ||
		attributes.some(attr => attr.toLowerCase().includes('key'));
	
	// Determine if it's required
	const isRequired = 
		!isNullable &&
		!isPrimaryKey &&
		!attributes.some(attr => attr.toLowerCase().includes('required')) ||
		attributes.some(attr => attr.toLowerCase().includes('required'));

	// Extract additional metadata from attributes
	const metadata = extractAttributeMetadata(attributes);

	return {
		name,
		type: cleanType,
		isPrimaryKey,
		isRequired,
		isNullable,
		attributes,
		inputType: getInputTypeForProperty({
			name,
			type: cleanType,
			attributes,
			isPrimaryKey,
			isRequired,
			isNullable
		}),
		...metadata
	};
}

/**
 * Extracts metadata from attributes like display name, description, etc.
 */
function extractAttributeMetadata(attributes: string[]): {
	displayName?: string;
	description?: string;
	maxLength?: number;
	minLength?: number;
} {
	const metadata: {
		displayName?: string;
		description?: string;
		maxLength?: number;
		minLength?: number;
	} = {};

	for (const attr of attributes) {
		// Display attribute
		const displayMatch = attr.match(/Display\s*\(\s*Name\s*=\s*"([^"]+)"/);
		if (displayMatch?.[1]) {
			metadata.displayName = displayMatch[1];
		}

		// Description
		const descMatch = attr.match(/Description\s*\(\s*"([^"]+)"/);
		if (descMatch?.[1]) {
			metadata.description = descMatch[1];
		}

		// String length
		const maxLengthMatch = attr.match(/(?:MaxLength|StringLength)\s*\(\s*(\d+)/);
		if (maxLengthMatch?.[1]) {
			metadata.maxLength = parseInt(maxLengthMatch[1], 10);
		}

		const minLengthMatch = attr.match(/MinLength\s*\(\s*(\d+)/);
		if (minLengthMatch?.[1]) {
			metadata.minLength = parseInt(minLengthMatch[1], 10);
		}
	}

	return metadata;
}

/**
 * Cleans up C# type names for better readability
 */
function cleanupType(type: string): string {
	return type
		.replace(/\s+/g, ' ') // Normalize whitespace
		.replace(/\?\s*$/, '') // Remove nullable marker
		.replace(/^(System\.)?/, '') // Remove System. prefix
		.replace(/^(Microsoft\..*?\.)?/, '') // Remove Microsoft namespace prefixes
		.trim();
}

/**
 * Determines appropriate HTML input type based on C# property type and attributes
 */
export function getInputTypeForProperty(property: ModelProperty): string {
	const type = property.type.toLowerCase();
	const attributes = property.attributes.map(attr => attr.toLowerCase());
	
	// Check attributes first for specific input types
	for (const [attrKey, inputType] of ATTRIBUTE_MAPPINGS) {
		if (attributes.some(attr => attr.includes(attrKey))) {
			return inputType;
		}
	}
	
	// Check type-based mappings
	for (const [typeKey, inputType] of TYPE_MAPPINGS) {
		if (type.includes(typeKey)) {
			return inputType;
		}
	}

	// Default to text for unknown types
	return 'text';
}