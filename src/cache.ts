import * as fs from 'fs';
import { ModelCacheEntry, ModelProperty } from './types';

/**
 * Cache for parsed model information to improve performance
 */
class ModelCache {
	private cache = new Map<string, ModelCacheEntry>();
	private readonly maxCacheSize = 100;
	private readonly cacheExpirationMs = 5 * 60 * 1000; // 5 minutes

	/**
	 * Gets cached model properties if available and not expired
	 */
	get(modelType: string, filePath: string): readonly ModelProperty[] | undefined {
		const entry = this.cache.get(modelType);
		if (!entry) {
			return undefined;
		}

		try {
			// Check if file has been modified
			const stats = fs.statSync(filePath);
			if (stats.mtimeMs > entry.lastModified) {
				this.cache.delete(modelType);
				return undefined;
			}

			// Check if cache entry has expired
			if (Date.now() - entry.lastModified > this.cacheExpirationMs) {
				this.cache.delete(modelType);
				return undefined;
			}

			return entry.properties;
		} catch {
			// File doesn't exist or can't be accessed
			this.cache.delete(modelType);
			return undefined;
		}
	}

	/**
	 * Stores model properties in cache
	 */
	set(modelType: string, filePath: string, properties: readonly ModelProperty[]): void {
		// Implement LRU-like eviction if cache is full
		if (this.cache.size >= this.maxCacheSize) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey) {
				this.cache.delete(firstKey);
			}
		}

		try {
			const stats = fs.statSync(filePath);
			const entry: ModelCacheEntry = {
				modelType,
				properties,
				lastModified: stats.mtimeMs,
				filePath
			};

			this.cache.set(modelType, entry);
		} catch {
			// If we can't stat the file, don't cache
		}
	}

	/**
	 * Clears the entire cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Removes a specific entry from cache
	 */
	delete(modelType: string): boolean {
		return this.cache.delete(modelType);
	}

	/**
	 * Gets current cache size
	 */
	get size(): number {
		return this.cache.size;
	}

	/**
	 * Cleans up expired entries
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.lastModified > this.cacheExpirationMs) {
				this.cache.delete(key);
			}
		}
	}
}

/**
 * Global model cache instance
 */
export const modelCache = new ModelCache();

/**
 * Periodically clean up the cache
 */
setInterval(() => {
	modelCache.cleanup();
}, 60000); // Clean every minute