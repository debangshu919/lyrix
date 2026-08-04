import OpenAI from "openai";
import { TranslationError } from "../../core/errors";
import type { TranslationConfig } from "../../core/types";

export function createTranslationClient(config: TranslationConfig): OpenAI {
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
