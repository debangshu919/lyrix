import type { TrackMetadata } from "../../types/metadata";
import { musicBrainzClient } from "./client";
import { mapRecordingToMetadata } from "./mapper";

export async function getMetadataFromUrl(
	url: string,
): Promise<TrackMetadata | null> {
	const entity = await musicBrainzClient.lookupUrl(url, ["recording-rels"]);
	const recordingId = entity.relations?.find((relation) => relation.recording)
		?.recording?.id;

	if (!recordingId) return null;

	const recording = await musicBrainzClient.lookup("recording", recordingId, [
		"artists",
		"releases",
	]);
	return mapRecordingToMetadata(recording);
}
