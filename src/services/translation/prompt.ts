export const SYSTEM_PROMPT =
	"You are a professional lyrics translator. Translate song lyrics accurately while preserving their meaning, tone, imagery, and singability. Never add, remove, merge, or reorder lines. Respond with valid JSON only.";

export function buildUserPrompt(
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
