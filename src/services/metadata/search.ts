import type { TrackMetadata } from "../../types/metadata";
import { musicBrainzClient } from "./client";
import { mapRecordingToMetadata } from "./mapper";

export async function getMetadataFromIsrc(
	isrc: string,
): Promise<TrackMetadata | null> {
	const result = await musicBrainzClient.search("recording", {
		query: `isrc:${isrc}`,
	});
	const [recording] = result.recordings;
	return recording ? mapRecordingToMetadata(recording) : null;
}

export async function getMetadataFromTrackAndArtist(
	trackName: string,
	artistName: string,
): Promise<TrackMetadata | null> {
	const result = await musicBrainzClient.search("recording", {
		query: `recording:"${trackName}" AND artist:"${artistName}"`,
	});
	const [recording] = result.recordings;
	return recording ? mapRecordingToMetadata(recording) : null;
}

export async function getMetadataFromTrackName(
	trackName: string,
): Promise<TrackMetadata | null> {
	const result = await musicBrainzClient.search("recording", {
		query: `recording:"${trackName}"`,
	});
	const [recording] = result.recordings;
	return recording ? mapRecordingToMetadata(recording) : null;
}
