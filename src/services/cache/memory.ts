import type { CacheAdapter } from "./adapter";

/**
 * In-memory cache adapter. Stores cached entries in a `Map`. Useful for
 * testing or when persistence is not needed.
 */
export class MemoryCacheAdapter implements CacheAdapter {
	private readonly store = new Map<string, string>();

	public async get(key: string): Promise<string | null> {
		return this.store.get(key) ?? null;
	}

	public async set(key: string, value: string): Promise<void> {
		this.store.set(key, value);
	}
}
