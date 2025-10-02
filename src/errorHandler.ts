import * as vscode from 'vscode';
import { Logger } from './types';

/**
 * Base error class for the extension
 */
export class ExtensionError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'ExtensionError';
	}
}

/**
 * Error for file system operations
 */
export class FileSystemError extends ExtensionError {
	constructor(message: string, public readonly path: string, cause?: Error) {
		super(message, 'FILESYSTEM_ERROR', { path, cause: cause?.message });
		this.name = 'FileSystemError';
	}
}

/**
 * Error for template processing
 */
export class TemplateError extends ExtensionError {
	constructor(message: string, public readonly templateName: string, cause?: Error) {
		super(message, 'TEMPLATE_ERROR', { templateName, cause: cause?.message });
		this.name = 'TemplateError';
	}
}

/**
 * Error for model parsing
 */
export class ModelParsingError extends ExtensionError {
	constructor(message: string, public readonly modelType: string, cause?: Error) {
		super(message, 'MODEL_PARSING_ERROR', { modelType, cause: cause?.message });
		this.name = 'ModelParsingError';
	}
}

/**
 * Error for project detection
 */
export class ProjectDetectionError extends ExtensionError {
	constructor(message: string, public readonly workspacePath: string) {
		super(message, 'PROJECT_DETECTION_ERROR', { workspacePath });
		this.name = 'ProjectDetectionError';
	}
}

/**
 * Centralized error handler for the extension
 */
export class ErrorHandler {
	constructor(private readonly logger: Logger) {}

	/**
	 * Handles an error and shows appropriate user message
	 */
	handleError(error: Error, context?: string): void {
		const contextMessage = context ? ` (${context})` : '';
		
		if (error instanceof ExtensionError) {
			this.logger.error(`${error.name}${contextMessage}: ${error.message}`, error);
			this.showUserError(error.message);
		} else {
			this.logger.error(`Unexpected error${contextMessage}: ${error.message}`, error);
			this.showUserError(`An unexpected error occurred: ${error.message}`);
		}
	}

	/**
	 * Handles an error with a custom user message
	 */
	handleErrorWithMessage(error: Error, userMessage: string, context?: string): void {
		const contextMessage = context ? ` (${context})` : '';
		this.logger.error(`Error${contextMessage}: ${error.message}`, error);
		this.showUserError(userMessage);
	}

	/**
	 * Shows an error message to the user
	 */
	private showUserError(message: string): void {
		void vscode.window.showErrorMessage(message);
	}

	/**
	 * Handles an async operation with error handling
	 */
	async handleAsync<T>(
		operation: () => Promise<T>,
		context: string,
		userErrorMessage?: string
	): Promise<T | undefined> {
		try {
			return await operation();
		} catch (error) {
			if (userErrorMessage) {
				this.handleErrorWithMessage(error as Error, userErrorMessage, context);
			} else {
				this.handleError(error as Error, context);
			}
			return undefined;
		}
	}

	/**
	 * Wraps a function with error handling
	 */
	wrap<TArgs extends unknown[], TReturn>(
		fn: (...args: TArgs) => Promise<TReturn>,
		context: string,
		userErrorMessage?: string
	): (...args: TArgs) => Promise<TReturn | undefined> {
		return async (...args: TArgs) => {
			return this.handleAsync(() => fn(...args), context, userErrorMessage);
		};
	}
}

/**
 * Creates an error handler instance
 */
export function createErrorHandler(logger: Logger): ErrorHandler {
	return new ErrorHandler(logger);
}