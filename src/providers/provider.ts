import type { LyricsOptions } from "../core/types";
import type { TrackMetadata } from "../types/metadata";

export interface Track {
	trackName?: string;
	artistName?: string;
	isrc?: string;
	url?: string;
}

export interface LyricsProvider {
	name: string;
	fetchLyrics: (
		metadata: TrackMetadata,
		options?: LyricsOptions,
	) => Promise<LyricsResult | null>;
}

export interface LyricsResult {
	track: TrackMetadata;
	lyricsProvider: string;
	lyrics: string[];
	synced?: boolean;
	syncedLyrics?: LyricsLine[];
}

export interface LyricsLine {
	text: string;
	startTime?: number;
}
