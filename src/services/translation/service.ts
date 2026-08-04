import type { TranslationConfig } from "../../core/types";
import type { LyricsLine } from "../../providers/provider";
import { translateLines, translateSyncedLines } from "./lines";

export class TranslationService {
	/*
	 * Translates lyrics lines to the target language.
	 * Empty lines are preserved in place so line alignment is maintained.
	 * @param lines - The lyrics lines to translate.
	 * @param to - The target language (name or ISO code).
	 * @param from - The source language. Defaults to auto-detection.
	 * @param config - The translation API configuration (apiKey, model, baseUrl).
	 * @returns The translated lines, aligned one-to-one with the input.
	 */
	public static async translateLines(
		lines: string[],
		to: string,
		from: string | undefined,
		config: TranslationConfig,
	): Promise<string[]> {
		return translateLines(lines, to, from, config);
	}

	/*
	 * Translates synced lyrics lines to the target language, preserving timestamps.
	 * @param lines - The synced lyrics lines to translate.
	 * @param to - The target language (name or ISO code).
	 * @param from - The source language. Defaults to auto-detection.
	 * @param config - The translation API configuration (apiKey, model, baseUrl).
	 * @returns The translated lines with their original timestamps.
	 */
	public static async translateSyncedLines(
		lines: LyricsLine[],
		to: string,
		from: string | undefined,
		config: TranslationConfig,
	): Promise<LyricsLine[]> {
		return translateSyncedLines(lines, to, from, config);
	}
}
