import assert from "node:assert/strict";
import { test } from "node:test";
import { MetadataService } from "../dist/services/metadata/service.js";

const url = "https://open.spotify.com/track/2AMysGXOe0zzZJMtH3Nizb";
const isrc = "NLM5S2402145";
const trackName = "Carry You";
const artistName = "Martin Garrix";

function assertMetadata(metadata) {
	assert.ok(metadata);
	assert.match(metadata.trackId, /^[0-9a-f-]{36}$/);
	assert.ok(metadata.trackName);
	assert.ok(metadata.artists);
}

test("gets metadata from a URL", async () => {
	const metadata = await MetadataService.getTrackMetadata({ url });

	assertMetadata(metadata);
	assert.equal(metadata.trackName, "Formidable");
	assert.equal(metadata.artists, "Stromae");
});

test("gets metadata from an ISRC", async () => {
	const metadata = await MetadataService.getTrackMetadata({ isrc });

	assertMetadata(metadata);
	assert.equal(metadata.trackName, trackName);
	assert.match(metadata.artists, /Martin Garrix/);
});

test("gets metadata from a track name", async () => {
	const metadata = await MetadataService.getTrackMetadata({ trackName });

	assertMetadata(metadata);
	assert.equal(metadata.trackName, trackName);
});

test("gets metadata from a track name and artist name", async () => {
	const metadata = await MetadataService.getTrackMetadata({
		trackName,
		artistName,
	});

	assertMetadata(metadata);
	assert.equal(metadata.trackName, trackName);
	assert.match(metadata.artists, /Martin Garrix/);
});
