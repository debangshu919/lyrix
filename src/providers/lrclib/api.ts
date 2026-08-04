import { Client } from "lrclib-api";
import type { LyricsOptions } from "../../core/types";
import type { TrackMetadata } from "../../types/metadata";
import type { LyricsProvider, LyricsResult } from "../provider";

class LrcLibProvider implements LyricsProvider {
	constructor(private client: Client = new Client()) {}

	private async fetchUnsyncedLyrics(
		metadata: TrackMetadata,
		_cache: boolean = false,
	): Promise<LyricsResult | null> {
		const lyrics = await this.client.getUnsynced({
			track_name: metadata.trackName,
			artist_name: metadata.artists,
			...(metadata.duration === undefined
				? {}
				: { duration: metadata.duration }),
		});

		if (!lyrics) return null;

		return {
			track: metadata,
			lyricsProvider: "lrclib",
			lyrics: lyrics.map((line) => line.text),
			synced: false,
		};
	}

	private async fetchSyncedLyrics(
		metadata: TrackMetadata,
		_cache: boolean = false,
	): Promise<LyricsResult | null> {
		const syncedLyrics = await this.client.getSynced({
			track_name: metadata.trackName,
			artist_name: metadata.artists,
			...(metadata.duration === undefined
				? {}
				: { duration: metadata.duration }),
		});

		if (!syncedLyrics) return null;

		return {
			track: metadata,
			lyricsProvider: "lrclib",
			lyrics: syncedLyrics.map((line) => line.text),
			synced: true,
			syncedLyrics,
		};
	}

	public async fetchLyrics(
		metadata: TrackMetadata,
		options?: LyricsOptions,
	): Promise<LyricsResult | null> {
		if (!options) {
			return this.fetchUnsyncedLyrics(metadata, false);
		}
		if (options.sync) {
			return this.fetchSyncedLyrics(metadata, options.cache ?? false);
		}
		return this.fetchUnsyncedLyrics(metadata, options.cache ?? false);
	}
}

export const provider = new LrcLibProvider();
