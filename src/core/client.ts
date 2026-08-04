import type {
	LyricsProvider,
	LyricsResult,
	Track,
} from "../providers/provider";
import { MetadataService } from "../services/metadata/service";
import { TranslationService } from "../services/translation/service";
import { NoLyricsFoundError, TranslationError } from "./errors";
import type { LyricsOptions } from "./types";

export class LyrixClient {
	private readonly providers: LyricsProvider[];

	constructor(config: { providers: LyricsProvider[] }) {
		this.providers = config.providers;
	}

	/*
	 * Applies translation to the lyrics result when requested.
	 * Synced lines are translated in a single request and the plain lyrics
	 * are derived from them, so timestamps and plain lines stay aligned.
	 */
	private async applyTranslation(
		result: LyricsResult,
		options?: LyricsOptions,
	): Promise<LyricsResult> {
		if (!options?.translateTo) return result;

		if (!options.translation) {
			throw new TranslationError(
				"Translation was requested but no API config was provided. Set `translation: { apiKey, model, baseUrl? }` in LyricsOptions.",
			);
		}

		const { translateTo, translateFrom, translation } = options;

		if (result.syncedLyrics && result.syncedLyrics.length > 0) {
			const syncedLyrics = await TranslationService.translateSyncedLines(
				result.syncedLyrics,
				translateTo,
				translateFrom,
				translation,
			);
			return {
				...result,
				syncedLyrics,
				lyrics: syncedLyrics.map((line) => line.text),
			};
		}

		const lyrics = await TranslationService.translateLines(
			result.lyrics,
			translateTo,
			translateFrom,
			translation,
		);
		return { ...result, lyrics };
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
		// Fetch track metadata
		const metadata = await MetadataService.getTrackMetadata(track);
		if (!metadata)
			throw new NoLyricsFoundError(
				track.trackName ?? "unknown",
				track.artistName ?? "unknown",
			);

		// Use the track metadata to fetch lyrics
		for (const provider of this.providers) {
			let result: LyricsResult | null = null;
			try {
				result = await provider.fetchLyrics(metadata, options);
			} catch {
				continue;
			}

			// Translate the lyrics if requested, then return
			if (result) return this.applyTranslation(result, options);
		}
		throw new NoLyricsFoundError(
			track.trackName ?? "unknown",
			track.artistName ?? "unknown",
		);
	}
}
