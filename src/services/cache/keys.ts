import { createHash } from "node:crypto";
import type { Track } from "../../providers/provider";

function sha256(input: string): string {
	return createHash("sha256").update(input).digest("hex");
}

export class CacheKeys {
	public static metadata(track: Track): string | null {
		if (track.isrc) {
			return `metadata:${sha256(`isrc:${track.isrc.trim().toLowerCase()}`)}`;
		}
		if (track.trackName && track.artistName) {
			const trackName = track.trackName.trim().toLowerCase();
			const artistName = track.artistName.trim().toLowerCase();
			return `metadata:${sha256(`track:${trackName}|artist:${artistName}`)}`;
		}
		if (track.trackName) {
			const trackName = track.trackName.trim().toLowerCase();
			return `metadata:${sha256(`track:${trackName}`)}`;
		}
		if (track.url) {
			return `metadata:${sha256(`url:${track.url.trim()}`)}`;
		}
		return null;
	}

	public static lyrics(
		trackId: string,
		provider: string,
		sync: boolean,
	): string {
		return `lyrics:${trackId}:${provider}:${sync ? "sync" : "unsync"}`;
	}

	public static translation(
		lines: string[],
		to: string,
		from: string | undefined,
		model: string,
	): string {
		const digest = sha256(
			`${lines.join("\n")}\u0000${to}\u0000${from ?? ""}\u0000${model}`,
		);
		return `translation:${digest}`;
	}
}
