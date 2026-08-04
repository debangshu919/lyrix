import { TranslationError } from "../../core/errors";

export function parseTranslatedLines(
	content: string,
	expectedCount: number,
): string[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new TranslationError("The translation model returned invalid JSON.");
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
