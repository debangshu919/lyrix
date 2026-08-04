import type { CacheAdapter, CacheEntry } from "./adapter";

const CACHE_VERSION = 1;

export class CacheService {
	public static async get<T>(
		adapter: CacheAdapter,
		key: string,
	): Promise<T | null> {
		const raw = await adapter.get(key);
		if (raw === null) return null;

		try {
			const entry = JSON.parse(raw) as CacheEntry<T>;
			if (entry.v !== CACHE_VERSION) return null;
			return entry.value;
		} catch {
			return null;
		}
	}

	public static async set<T>(
		adapter: CacheAdapter,
		key: string,
		value: T,
	): Promise<void> {
		const entry: CacheEntry<T> = {
			v: CACHE_VERSION,
			createdAt: Date.now(),
			value,
		};
		await adapter.set(key, JSON.stringify(entry));
	}
}
