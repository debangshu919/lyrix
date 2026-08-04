export interface CacheAdapter {
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
}

export interface CacheEntry<T> {
	v: number;
	createdAt: number;
	value: T;
}
