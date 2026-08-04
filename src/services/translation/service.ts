import type { TranslationConfig } from "../../core/types";
import type { LyricsLine } from "../../providers/provider";
import { translateLines, translateSyncedLines } from "./lines";

export class TranslationService {
	public static async translateLines(
		lines: string[],
		to: string,
		from: string | undefined,
		config: TranslationConfig,
	): Promise<string[]> {
		return translateLines(lines, to, from, config);
	}

	public static async translateSyncedLines(
		lines: LyricsLine[],
		to: string,
		from: string | undefined,
		config: TranslationConfig,
	): Promise<LyricsLine[]> {
		return translateSyncedLines(lines, to, from, config);
	}
}
