import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { LyrixClient } from "../../dist/core/client.js";
import { TranslationError } from "../../dist/core/errors.js";
import { MetadataService } from "../../dist/services/metadata/service.js";
import { TranslationService } from "../../dist/services/translation/service.js";

afterEach(() => mock.restoreAll());

const metadata = {
	trackId: "recording-id",
	trackName: "Carry You",
	artists: "Martin Garrix",
	duration: 215905,
};

const translation = { apiKey: "test-key", model: "test-model" };

function mockMetadata() {
	mock.method(MetadataService, "getTrackMetadata", async () => metadata);
}

test("returns lyrics untouched when no translation is requested", async () => {
	mockMetadata();
	const translateSpy = mock.method(
		TranslationService,
		"translateLines",
		async () => [],
	);
	const client = new LyrixClient({
		providers: [
			{
				fetchLyrics: async () => ({
					track: metadata,
					lyricsProvider: "fake",
					lyrics: ["First line", "Second line"],
					synced: false,
				}),
			},
		],
	});

	const result = await client.getLyrics({ trackName: "Carry You" });

	assert.deepEqual(result.lyrics, ["First line", "Second line"]);
	assert.equal(translateSpy.mock.callCount(), 0);
});

test("throws when translateTo is set without a translation config", async () => {
	mockMetadata();
	const client = new LyrixClient({
		providers: [
			{
				fetchLyrics: async () => ({
					track: metadata,
					lyricsProvider: "fake",
					lyrics: ["First line"],
					synced: false,
				}),
			},
		],
	});

	await assert.rejects(
		client.getLyrics({ trackName: "Carry You" }, { translateTo: "French" }),
		TranslationError,
	);
});

test("translates unsynced lyrics with the provided config", async () => {
	mockMetadata();
	let received;
	mock.method(
		TranslationService,
		"translateLines",
		async (lines, to, from, config) => {
			received = { lines, to, from, config };
			return ["Première ligne", "Deuxième ligne"];
		},
	);
	const client = new LyrixClient({
		providers: [
			{
				fetchLyrics: async () => ({
					track: metadata,
					lyricsProvider: "fake",
					lyrics: ["First line", "Second line"],
					synced: false,
				}),
			},
		],
	});

	const result = await client.getLyrics(
		{ trackName: "Carry You" },
		{ translateTo: "French", translateFrom: "English", translation },
	);

	assert.deepEqual(received, {
		lines: ["First line", "Second line"],
		to: "French",
		from: "English",
		config: translation,
	});
	assert.deepEqual(result.lyrics, ["Première ligne", "Deuxième ligne"]);
});

test("translates synced lyrics preserving timestamps", async () => {
	mockMetadata();
	mock.method(
		TranslationService,
		"translateSyncedLines",
		async (lines, _to, _from, _config) =>
			lines.map((line, index) => ({
				text: `Ligne ${index + 1}`,
				startTime: line.startTime,
			})),
	);
	const translateLinesSpy = mock.method(
		TranslationService,
		"translateLines",
		async () => [],
	);
	const client = new LyrixClient({
		providers: [
			{
				fetchLyrics: async () => ({
					track: metadata,
					lyricsProvider: "fake",
					lyrics: ["First line", "Second line"],
					synced: true,
					syncedLyrics: [
						{ text: "First line", startTime: 1.25 },
						{ text: "Second line", startTime: 4.5 },
					],
				}),
			},
		],
	});

	const result = await client.getLyrics(
		{ trackName: "Carry You" },
		{ sync: true, translateTo: "French", translation },
	);

	assert.deepEqual(result.syncedLyrics, [
		{ text: "Ligne 1", startTime: 1.25 },
		{ text: "Ligne 2", startTime: 4.5 },
	]);
	assert.deepEqual(result.lyrics, ["Ligne 1", "Ligne 2"]);
	assert.equal(translateLinesSpy.mock.callCount(), 0);
});

test("rejects a translation config without an API key", async () => {
	await assert.rejects(
		TranslationService.translateLines(["line"], "French", undefined, {
			apiKey: "",
			model: "test-model",
		}),
		TranslationError,
	);
});

test("rejects a translation config without a model", async () => {
	await assert.rejects(
		TranslationService.translateLines(["line"], "French", undefined, {
			apiKey: "test-key",
			model: "",
		}),
		TranslationError,
	);
});
