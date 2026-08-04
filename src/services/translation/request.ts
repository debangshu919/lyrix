import type { OpenAI } from "openai";
import { TranslationError } from "../../core/errors";
import type { TranslationConfig } from "../../core/types";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { parseTranslatedLines } from "./response";

export async function requestTranslation(
	lines: string[],
	to: string,
	from: string | undefined,
	config: TranslationConfig,
	client: OpenAI,
): Promise<string[]> {
	let content: string | null | undefined;
	try {
		const completion = await client.chat.completions.create({
			model: config.model,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: buildUserPrompt(lines, to, from) },
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

	return parseTranslatedLines(content, lines.length);
}
