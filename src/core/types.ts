import type { LyricsLine } from "../providers/provider";
import type { TrackMetadata } from "../types/metadata";

export interface TranslationConfig {
	apiKey: string;
	model: string;
	baseUrl?: string;
}

export interface LyricsOptions {
	cache?: boolean;
	sync?: boolean;
	translateTo?: string;
	translateFrom?: string;
	translation?: TranslationConfig;
}

export interface Lyrics {
	metadata?: TrackMetadata;
	synced?: boolean;
	lines: string[];
	syncedLines?: LyricsLine[];
	provider?: string;
}
