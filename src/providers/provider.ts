import type { LyricsOptions } from "../core/types";
import type { TrackMetadata } from "../types/metadata";

/**
 * Identifies a track to search for lyrics.
 */
export interface Track {
	/** Track title. */
	trackName?: string;
	/** Artist name. */
	artistName?: string;
	/** ISRC identifier for the recording. */
	isrc?: string;
	/** MusicBrainz URL for the recording. */
	url?: string;
}

/**
 * A pluggable lyrics provider that can be passed to `LyrixClient`.
 *
 * @example
 * ```ts
 * const myProvider: LyricsProvider = {
 *   name: "my-provider",
 *   async fetchLyrics(metadata, options) {
 *     // fetch lyrics from your source
 *   },
 * };
 * ```
 */
export interface LyricsProvider {
	/** Unique name for this provider. */
	name: string;
	/** Fetches lyrics for the given track metadata. Returns null if not found. */
	fetchLyrics: (
		metadata: TrackMetadata,
		options?: LyricsOptions,
	) => Promise<LyricsResult | null>;
}

/**
 * The result of a lyrics fetch from a provider.
 */
export interface LyricsResult {
	/** The resolved track metadata. */
	track: TrackMetadata;
	/** Name of the provider that returned these lyrics. */
	lyricsProvider: string;
	/** Plain lyrics lines. */
	lyrics: string[];
	/** Whether the lyrics include timestamps. */
	synced?: boolean;
	/** Timestamped lyrics lines (only present for synced lyrics). */
	syncedLyrics?: LyricsLine[];
	/** Translated plain lyrics (only present when translation is requested). */
	translatedLyrics?: string[];
	/** Translated synced lyrics (only present when translation is requested). */
	translatedSyncedLyrics?: LyricsLine[];
}

/**
 * A single line of lyrics, optionally with a start time for synced lyrics.
 */
export interface LyricsLine {
	/** The lyrics text. */
	text: string;
	/** Start time in milliseconds (synced lyrics only). */
	startTime?: number;
}
