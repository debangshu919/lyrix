import type { LyricsLine, LyricsProvider } from "../providers/provider";
import type { CacheAdapter } from "../services/cache/adapter";
import type { TrackMetadata } from "../types/metadata";

/**
 * Configuration for the OpenAI-compatible translation API.
 */
export interface TranslationConfig {
	/** API key for the translation service. */
	apiKey: string;
	/** Model identifier (e.g. `"gpt-4o"`, `"gpt-4o-mini"`). */
	model: string;
	/** Optional base URL for custom API endpoints. */
	baseUrl?: string;
}

/**
 * Options for a lyrics fetch request.
 */
export interface LyricsOptions {
	/** Whether to request synced (timestamped) lyrics. */
	sync?: boolean;
	/** Target language for translation (e.g. `"Spanish"`, `"fr"`). */
	translateTo?: string;
	/** Source language for translation. Auto-detected if omitted. */
	translateFrom?: string;
	/** API configuration required when `translateTo` is set. */
	translation?: TranslationConfig;
}

/**
 * Configuration for creating a `LyrixClient`.
 */
export interface LyrixClientConfig {
	/** Lyrics providers to query in order. */
	providers: LyricsProvider[];
	/**
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
