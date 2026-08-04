import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CacheAdapter } from "./adapter";

export class FileCacheAdapter implements CacheAdapter {
	private readonly dir: string;

	constructor(dir: string = ".lyrix-cache") {
		this.dir = path.resolve(dir);
	}

	private filePath(key: string): string {
		const safe = key.replace(/[^a-zA-Z0-9_-]+/g, "_");
		return path.join(this.dir, `${safe}.json`);
	}

	public async get(key: string): Promise<string | null> {
		try {
			return await readFile(this.filePath(key), "utf8");
		} catch {
			return null;
		}
	}

	public async set(key: string, value: string): Promise<void> {
		await mkdir(this.dir, { recursive: true });
		const target = this.filePath(key);
		const temp = `${target}.tmp`;
		await writeFile(temp, value, "utf8");
		await rename(temp, target);
	}
}
