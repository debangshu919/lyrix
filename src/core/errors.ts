export class LyrixError extends Error {
	constructor(message: string) {
		super(message);
		this.name = new.target.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NoLyricsFoundError extends LyrixError {
	readonly title: string;
	readonly artist: string;

	constructor(title: string, artist: string) {
		super(`No lyrics found for "${title}" by ${artist}.`);
		this.title = title;
		this.artist = artist;
	}
}

export class TranslationError extends LyrixError {
	constructor(message = "Lyrics translation failed.") {
		super(message);
	}
}
