/**
 * Pluggable cache storage. Implement this to use a custom cache backend
 * (Redis, SQLite, etc.) with `LyrixClient`.
 *
 * @example
 * ```ts
 * const redisAdapter: CacheAdapter = {
 *   async get(key) {
 *     return redis.get(key);
 *   },
 *   async set(key, value) {
 *     await redis.set(key, value);
 *   },
 * };
 * ```
 */
export interface CacheAdapter {
	/** Retrieves a cached value by key, or null if not found. */
	get(key: string): Promise<string | null>;
	/** Stores a value under the given key. */
	set(key: string, value: string): Promise<void>;
}

export interface CacheEntry<T> {
	v: number;
	createdAt: number;
	value: T;
}
