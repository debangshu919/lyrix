import type { LyricsLine } from "../providers/provider";
import type { TrackMetadata } from "../types/metadata";

export interface LyricsOptions {
	cache?: boolean;
	sync?: boolean;
	translateTo?: string;
	translateFrom?: string;
}

export interface Lyrics {
	metadata?: TrackMetadata;
	synced?: boolean;
	lines: string[];
	syncedLines?: LyricsLine[];
	provider?: string;
}
