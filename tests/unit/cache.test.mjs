import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { FileCacheAdapter } from "../../dist/services/cache/file.js";
import { CacheKeys } from "../../dist/services/cache/keys.js";
import { MemoryCacheAdapter } from "../../dist/services/cache/memory.js";
import { CacheService } from "../../dist/services/cache/service.js";

const tempDirs = [];

afterEach(async () => {
	for (const dir of tempDirs.splice(0)) {
		await rm(dir, { recursive: true, force: true });
	}
});

async function makeTempDir() {
	const dir = await mkdtemp(path.join(os.tmpdir(), "lyrix-cache-test-"));
	tempDirs.push(dir);
	return dir;
}

test("memory adapter round-trips values through CacheService", async () => {
	const adapter = new MemoryCacheAdapter();
	await CacheService.set(adapter, "k", { a: 1 });
	assert.deepEqual(await CacheService.get(adapter, "k"), { a: 1 });
});

test("cache misses on unknown keys", async () => {
	const adapter = new MemoryCacheAdapter();
	assert.equal(await CacheService.get(adapter, "missing"), null);
});

test("cache misses on corrupt entries", async () => {
	const adapter = new MemoryCacheAdapter();
	await adapter.set("k", "{not json");
	assert.equal(await CacheService.get(adapter, "k"), null);
});

test("cache misses on version mismatch", async () => {
	const adapter = new MemoryCacheAdapter();
	await adapter.set(
		"k",
		JSON.stringify({ v: 999, createdAt: Date.now(), value: { a: 1 } }),
	);
	assert.equal(await CacheService.get(adapter, "k"), null);
});

test("file adapter round-trips values through CacheService", async () => {
	const adapter = new FileCacheAdapter(await makeTempDir());
	await CacheService.set(adapter, "lyrics:id:lrclib:sync", { lines: ["a"] });
	assert.deepEqual(await CacheService.get(adapter, "lyrics:id:lrclib:sync"), {
		lines: ["a"],
	});
});

test("file adapter misses on missing and corrupt files", async () => {
	const dir = await makeTempDir();
	const adapter = new FileCacheAdapter(dir);
	assert.equal(await CacheService.get(adapter, "missing"), null);

	await adapter.set("corrupt", "value");
	const [file] = await readdir(dir);
	await writeFile(path.join(dir, file), "{not json");
	assert.equal(await CacheService.get(adapter, "corrupt"), null);
});

test("metadata keys normalize casing and whitespace", () => {
	const a = CacheKeys.metadata({
		trackName: "Perfect",
		artistName: "Ed Sheeran",
	});
	const b = CacheKeys.metadata({
		trackName: "  perfect ",
		artistName: "ed sheeran",
	});
	assert.equal(a, b);
	assert.ok(a.startsWith("metadata:"));
});

test("metadata keys prefer ISRC over other fields", () => {
	const byIsrc = CacheKeys.metadata({
		isrc: "NLM5S2402145",
		trackName: "Perfect",
	});
	const byTrack = CacheKeys.metadata({ trackName: "Perfect" });
	assert.notEqual(byIsrc, byTrack);
});

test("metadata keys differ per query strategy", () => {
	const withArtist = CacheKeys.metadata({
		trackName: "Perfect",
		artistName: "Ed Sheeran",
	});
	const withoutArtist = CacheKeys.metadata({ trackName: "Perfect" });
	const byUrl = CacheKeys.metadata({ url: "https://example.com/track" });
	assert.notEqual(withArtist, withoutArtist);
	assert.notEqual(withArtist, byUrl);
});

test("metadata key is null for an empty track", () => {
	assert.equal(CacheKeys.metadata({}), null);
});

test("lyrics keys vary by provider and sync mode", () => {
	assert.equal(CacheKeys.lyrics("id", "lrclib", true), "lyrics:id:lrclib:sync");
	assert.equal(
		CacheKeys.lyrics("id", "lrclib", false),
		"lyrics:id:lrclib:unsync",
	);
	assert.notEqual(
		CacheKeys.lyrics("id", "lrclib", true),
		CacheKeys.lyrics("id", "other", true),
	);
});

test("translation keys vary by language and model", () => {
	const lines = ["first", "second"];
	const base = CacheKeys.translation(lines, "English", "Japanese", "model-a");
	assert.equal(
		base,
		CacheKeys.translation(lines, "English", "Japanese", "model-a"),
	);
	assert.notEqual(
		base,
		CacheKeys.translation(lines, "French", "Japanese", "model-a"),
	);
	assert.notEqual(
		base,
		CacheKeys.translation(lines, "English", undefined, "model-a"),
	);
	assert.notEqual(
		base,
		CacheKeys.translation(lines, "English", "Japanese", "model-b"),
	);
	assert.notEqual(
		base,
		CacheKeys.translation(["other"], "English", "Japanese", "model-a"),
	);
});
