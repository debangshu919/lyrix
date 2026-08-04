import OpenAI from "openai";
import { TranslationError } from "../../core/errors";
import type { TranslationConfig } from "../../core/types";
import type { LyricsLine } from "../../providers/provider";

const SYSTEM_PROMPT =
	"You are a professional lyrics translator. Translate song lyrics accurately while preserving their meaning, tone, imagery, and singability. Never add, remove, merge, or reorder lines. Respond with valid JSON only.";

export class TranslationService {
	private static createClient(config: TranslationConfig): OpenAI {
		if (!config.apiKey || config.apiKey.trim().length === 0) {
			throw new TranslationError(
				"A translation API key is required. Provide `translation.apiKey` in LyricsOptions.",
			);
		}
		if (!config.model || config.model.trim().length === 0) {
			throw new TranslationError(
				"A translation model is required. Provide `translation.model` in LyricsOptions.",
			);
		}
		return new OpenAI({
			apiKey: config.apiKey,
			...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
		});
	}

	private static buildUserPrompt(
		lines: string[],
		to: string,
		from?: string,
	): string {
		const source = from ? `from ${from} ` : "";
		return [
			`Translate the following song lyrics ${source}to ${to}.`,
			`Keep exactly ${lines.length} lines in the same order, one translated line per input line.`,
			'Respond with JSON only, in the form {"lines": ["...", "..."]}.',
			"",
			JSON.stringify({ lines }, null, 2),
		].join("\n");
	}

	private static parseTranslatedLines(
		content: string,
		expectedCount: number,
	): string[] {
		let parsed: unknown;
		try {
			parsed = JSON.parse(content);
		} catch {
			throw new TranslationError(
				"The translation model returned invalid JSON.",
			);
		}

		if (
			typeof parsed !== "object" ||
			parsed === null ||
			!("lines" in parsed) ||
			!Array.isArray(parsed.lines)
		) {
			throw new TranslationError(
				'The translation model response is missing the "lines" array.',
			);
		}

		const lines: unknown[] = parsed.lines;

		if (lines.length !== expectedCount) {
			throw new TranslationError(
				`The translation model returned ${lines.length} lines, expected ${expectedCount}.`,
			);
		}

		const translated: string[] = [];
		for (const line of lines) {
			if (typeof line !== "string") {
				throw new TranslationError(
					"The translation model returned a non-string line.",
				);
			}
			translated.push(line);
		}
		return translated;
	}

	private static async requestTranslation(
		lines: string[],
		to: string,
		from: string | undefined,
		config: TranslationConfig,
	): Promise<string[]> {
		const client = TranslationService.createClient(config);

		let content: string | null | undefined;
		try {
			const completion = await client.chat.completions.create({
				model: config.model,
				response_format: { type: "json_object" },
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{
						role: "user",
						content: TranslationService.buildUserPrompt(lines, to, from),
					},
				],
			});
			content = completion.choices[0]?.message.content;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new TranslationError(`Translation request failed: ${message}`);
		}

		if (!content) {
			throw new TranslationError("The translation model returned no content.");
		}

		return TranslationService.parseTranslatedLines(content, lines.length);
	}

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
		if (to.trim().length === 0) {
			throw new TranslationError("A target language is required.");
		}

		const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

		if (nonEmptyLines.length === 0) return [...lines];

		const translated = await TranslationService.requestTranslation(
			nonEmptyLines,
			to,
			from,
			config,
		);

		let cursor = 0;
		return lines.map((line) => {
			if (line.trim().length === 0) return line;
			const text = translated[cursor];
			cursor += 1;
			return text ?? line;
		});
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
		const translated = await TranslationService.translateLines(
			lines.map((line) => line.text),
			to,
			from,
			config,
		);

		return lines.map((line, index) => ({
			text: translated[index] ?? line.text,
			...(line.startTime === undefined ? {} : { startTime: line.startTime }),
		}));
	}
}
