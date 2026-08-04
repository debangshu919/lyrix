import { Client } from "lrclib-api";
import type { LyricsOptions } from "../../core/types";
import type { TrackMetadata } from "../../types/metadata";
import type { LyricsProvider, LyricsResult } from "../provider";

class LrcLibProvider implements LyricsProvider {
	public readonly name = "lrclib";

	constructor(private client: Client = new Client()) {}

	private async fetchUnsyncedLyrics(
		metadata: TrackMetadata,
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
		if (options?.sync) {
			return this.fetchSyncedLyrics(metadata);
		}
		return this.fetchUnsyncedLyrics(metadata);
	}
}

/**
 * Built-in LRCLIB lyrics provider. Queries synced and unsynced lyrics
 * from [lrclib.net](https://lrclib.net).
 */
export const provider = new LrcLibProvider();
