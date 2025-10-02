/**
 * Represents a C# model property with its metadata
 */
export interface ModelProperty {
	readonly name: string;
	readonly type: string;
	readonly isPrimaryKey: boolean;
	readonly isRequired: boolean;
	readonly isNullable: boolean;
	readonly attributes: readonly string[];
	readonly inputType?: string;
	readonly displayName?: string;
	readonly description?: string;
	readonly maxLength?: number;
	readonly minLength?: number;
}

/**
 * Information about a controller and its action
 */
export interface ControllerInfo {
	readonly controllerName: string;
	readonly actionName: string;
	readonly namespace?: string;
	readonly returnType?: string;
	readonly parameters?: readonly ControllerParameter[];
}

/**
 * Controller action parameter information
 */
export interface ControllerParameter {
	readonly name: string;
	readonly type: string;
	readonly isOptional: boolean;
	readonly defaultValue?: string;
}

/**
 * Data passed to Handlebars templates for view generation
 */
export interface TemplateData {
	readonly actionName: string;
	readonly controllerName: string;
	readonly model?: string;
	readonly modelName: string;
	readonly layoutPage?: string | null;
	readonly properties: readonly ModelProperty[];
	readonly primaryKeyProperty?: string | undefined;
	readonly projectName?: string;
	readonly namespace?: string;
	readonly usings?: readonly string[];
	readonly viewTitle?: string;
	readonly description?: string;
}

/**
 * Options for generating a view file
 */
export interface ViewGenerationOptions {
	readonly workspacePath: string;
	readonly controllerName: string;
	readonly actionName: string;
	readonly templateType: string;
	readonly modelType?: string;
	readonly layoutPage?: string | null;
	readonly outputPath?: string;
	readonly overwrite?: boolean;
	readonly openAfterGeneration?: boolean;
}

/**
 * Configuration options for the extension
 */
export interface ExtensionConfiguration {
	readonly defaultTemplateDirectory: string;
	readonly useLayoutByDefault: boolean;
	readonly defaultLayoutName: string;
	readonly enableLogging: boolean;
}

/**
 * Supported template types for view generation
 */
export type TemplateType = 'empty' | 'index' | 'create' | 'edit' | 'details' | 'delete';

/**
 * Supported C# types with their corresponding HTML input types
 */
export interface TypeMapping {
	readonly csharpType: string;
	readonly htmlInputType: string;
	readonly isNumeric: boolean;
	readonly requiresValidation: boolean;
}

/**
 * Cache entry for parsed model information
 */
export interface ModelCacheEntry {
	readonly modelType: string;
	readonly properties: readonly ModelProperty[];
	readonly lastModified: number;
	readonly filePath: string;
}

/**
 * Logging interface for the extension
 */
export interface Logger {
	debug(message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, error?: Error, ...args: unknown[]): void;
}