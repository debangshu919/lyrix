import type { Track } from "../../providers/provider";
import type { TrackMetadata } from "../../types/metadata";
import {
	getMetadataFromIsrc,
	getMetadataFromTrackAndArtist,
	getMetadataFromTrackName,
} from "./search";
import { getMetadataFromUrl } from "./url";

export class MetadataService {
	public static async getTrackMetadata(
		trackInfo: Track,
	): Promise<TrackMetadata | null> {
		if (trackInfo.isrc) {
			return getMetadataFromIsrc(trackInfo.isrc);
		}
		if (trackInfo.trackName && trackInfo.artistName) {
			return getMetadataFromTrackAndArtist(
				trackInfo.trackName,
				trackInfo.artistName,
			);
		}
		if (trackInfo.trackName) {
			return getMetadataFromTrackName(trackInfo.trackName);
		}
		if (trackInfo.url) {
			return getMetadataFromUrl(trackInfo.url);
		}
		return null;
	}
}
