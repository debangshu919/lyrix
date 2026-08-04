import type {
	LyricsProvider,
	LyricsResult,
	Track,
} from "../providers/provider";
import type { CacheAdapter } from "../services/cache/adapter";
import { FileCacheAdapter } from "../services/cache/file";
import { CacheKeys } from "../services/cache/keys";
import { CacheService } from "../services/cache/service";
import { MetadataService } from "../services/metadata/service";
import { TranslationService } from "../services/translation/service";
import type { TrackMetadata } from "../types/metadata";
import { NoLyricsFoundError, TranslationError } from "./errors";
import type { LyrixClientConfig, LyricsOptions } from "./types";

function resolveCacheAdapter(
	cache: boolean | CacheAdapter | undefined,
): CacheAdapter | null {
	if (cache === true) return new FileCacheAdapter();
	if (!cache) return null;
	return cache;
}

export class LyrixClient {
	private readonly providers: LyricsProvider[];
	private readonly cache: CacheAdapter | null;

	constructor(config: LyrixClientConfig) {
		this.providers = config.providers;
		this.cache = resolveCacheAdapter(config.cache);
	}

	/*
	 * Resolves track metadata, serving and storing it in the cache when
	 * caching is enabled.
	 */
	private async getMetadata(track: Track): Promise<TrackMetadata | null> {
		const cacheKey = this.cache ? CacheKeys.metadata(track) : null;
		if (this.cache && cacheKey) {
			const cached = await CacheService.get<TrackMetadata>(
				this.cache,
				cacheKey,
			);
			if (cached) return cached;
		}

		const metadata = await MetadataService.getTrackMetadata(track);
		if (metadata && this.cache && cacheKey) {
			await CacheService.set(this.cache, cacheKey, metadata);
		}
		return metadata;
	}

	/*
	 * Fetches lyrics from a single provider, serving and storing them in
	 * the cache when caching is enabled. Provider failures return null so
	 * the caller can move on to the next provider.
	 */
	private async getLyricsFromProvider(
		provider: LyricsProvider,
		metadata: TrackMetadata,
		options?: LyricsOptions,
	): Promise<LyricsResult | null> {
		const cacheKey = CacheKeys.lyrics(
			metadata.trackId,
			provider.name,
			options?.sync ?? false,
		);
		if (this.cache) {
			const cached = await CacheService.get<LyricsResult>(this.cache, cacheKey);
			if (cached) return cached;
		}

		let result: LyricsResult | null = null;
		try {
			result = await provider.fetchLyrics(metadata, options);
		} catch {
			return null;
		}

		if (result && this.cache) {
			await CacheService.set(this.cache, cacheKey, result);
		}
		return result;
	}

	/*
	 * Attaches translated lines to the lyrics result, keeping the originals.
	 * Synced translations keep their timestamps and the plain translated
	 * lyrics are derived from them, so timestamps and plain lines stay
	 * aligned.
	 */
	private withTranslatedLines(
		result: LyricsResult,
		translated: string[],
	): LyricsResult {
		if (result.syncedLyrics && result.syncedLyrics.length > 0) {
			const translatedSyncedLyrics = result.syncedLyrics.map((line, index) => ({
				text: translated[index] ?? line.text,
				...(line.startTime === undefined ? {} : { startTime: line.startTime }),
			}));
			return {
				...result,
				translatedSyncedLyrics,
				translatedLyrics: translatedSyncedLyrics.map((line) => line.text),
			};
		}
		return { ...result, translatedLyrics: translated };
	}

	/*
	 * Applies translation to the lyrics result when requested. Synced and
	 * unsynced lyrics share one translation cache entry keyed by the line
	 * texts, languages and model.
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
		const sourceLines =
			result.syncedLyrics && result.syncedLyrics.length > 0
				? result.syncedLyrics.map((line) => line.text)
				: result.lyrics;
		const cacheKey = this.cache
			? CacheKeys.translation(
					sourceLines,
					translateTo,
					translateFrom,
					translation.model,
				)
			: null;

		if (this.cache && cacheKey) {
			const cached = await CacheService.get<string[]>(this.cache, cacheKey);
			if (cached) return this.withTranslatedLines(result, cached);
		}

		const translated = await TranslationService.translateLines(
			sourceLines,
			translateTo,
			translateFrom,
			translation,
		);

		if (this.cache && cacheKey) {
			await CacheService.set(this.cache, cacheKey, translated);
		}
		return this.withTranslatedLines(result, translated);
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
		const metadata = await this.getMetadata(track);
		if (!metadata)
			throw new NoLyricsFoundError(
				track.trackName ?? "unknown",
				track.artistName ?? "unknown",
			);

		// Use the track metadata to fetch lyrics
		for (const provider of this.providers) {
			const result = await this.getLyricsFromProvider(
				provider,
				metadata,
				options,
			);

			// Translate the lyrics if requested, then return
			if (result) return this.applyTranslation(result, options);
		}
		throw new NoLyricsFoundError(
			track.trackName ?? "unknown",
			track.artistName ?? "unknown",
		);
	}
}
