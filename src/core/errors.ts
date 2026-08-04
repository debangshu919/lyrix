/**
 * Base error class for all Lyrix errors.
 */
export class LyrixError extends Error {
	constructor(message: string) {
		super(message);
		this.name = new.target.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown when no lyrics are found for a track across all configured providers.
 */
export class NoLyricsFoundError extends LyrixError {
	/** The track title that was searched for. */
	readonly title: string;
	/** The artist name that was searched for. */
	readonly artist: string;

	constructor(title: string, artist: string) {
		super(`No lyrics found for "${title}" by ${artist}.`);
		this.title = title;
		this.artist = artist;
	}
}

/**
 * Thrown when lyrics translation fails or is misconfigured.
 */
export class TranslationError extends LyrixError {
	constructor(message = "Lyrics translation failed.") {
		super(message);
	}
}
