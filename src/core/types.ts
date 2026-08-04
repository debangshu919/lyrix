import type { LyricsLine, LyricsProvider } from "../providers/provider";
import type { CacheAdapter } from "../services/cache/adapter";
import type { TrackMetadata } from "../types/metadata";

export interface TranslationConfig {
	apiKey: string;
	model: string;
	baseUrl?: string;
}

export interface LyricsOptions {
	sync?: boolean;
	translateTo?: string;
	translateFrom?: string;
	translation?: TranslationConfig;
}

export interface LyrixClientConfig {
	providers: LyricsProvider[];
	/*
	 * Enables caching of metadata, lyrics and translations. `true` uses a
	 * file cache in `.lyrix-cache/`; a custom `CacheAdapter` can be passed
	 * to control storage.
	 */
	cache?: boolean | CacheAdapter;
}

export interface Lyrics {
	metadata?: TrackMetadata;
	synced?: boolean;
	lines: string[];
	syncedLines?: LyricsLine[];
	translatedLines?: string[];
	translatedSyncedLines?: LyricsLine[];
	provider?: string;
}
