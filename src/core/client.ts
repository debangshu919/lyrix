import type {
	LyricsProvider,
	LyricsResult,
	Track,
} from "../providers/provider";
import { MetadataService } from "../services/metadata/service";
import { NoLyricsFoundError } from "./errors";
import type { LyricsOptions } from "./types";

export class LyrixClient {
	private readonly providers: LyricsProvider[];

	constructor(config: { providers: LyricsProvider[] }) {
		this.providers = config.providers;
	}

	/*
	 * Retrieves lyrics for the given query from the configured providers.
	 * @param query The lyrics query.
	 * @returns A promise that resolves to an array of lyrics lines.
	 */
	async getLyrics(
		track: Track,
		options?: LyricsOptions,
	): Promise<LyricsResult> {
		/*
		 * 1. Fetch track metadata (X)
		 * 2. Use the track metadata to fetch lyrics (X)
		 * 3. Check if user wants translation
		 * 4. If yes, translate the lyrics.
		 * 5. Return the lyrics.
		 */

		// Fetch track metadata
		const metadata = await MetadataService.getTrackMetadata(track);
		if (!metadata)
			throw new NoLyricsFoundError(
				track.trackName ?? "unknown",
				track.artistName ?? "unknown",
			);

		// Use the track metadata to fetch lyrics
		for (const provider of this.providers) {
			try {
				const result = await provider.fetchLyrics(metadata, options);
				if (result) return result;
			} catch {}
		}
		throw new NoLyricsFoundError(track.trackName ?? "unknown", track.artistName ?? "unknown");
	}
}
