import type { TrackMetadata } from "../../types/metadata";

interface Recording {
	id: string;
	title: string;
	length?: number;
	"artist-credit"?: Array<{ name: string }>;
}

export function mapRecordingToMetadata(recording: Recording): TrackMetadata {
	return {
		trackId: recording.id,
		trackName: recording.title,
		artists:
			recording["artist-credit"]?.map((artist) => artist.name).join(", ") ?? "",
		...(recording.length === undefined ? {} : { duration: recording.length }),
	} satisfies TrackMetadata;
}
