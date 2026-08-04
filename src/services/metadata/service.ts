import type { Track } from "../../providers/provider";
import type { TrackMetadata } from "../../types/metadata";
import {
	getMetadataFromIsrc,
	getMetadataFromTrackAndArtist,
	getMetadataFromTrackName,
} from "./search";
import { getMetadataFromUrl } from "./url";

export class MetadataService {
	/*
	 * Gets the track metadata based on the provided track info.
	 * @param trackInfo - The track info to get the metadata for.
	 * @returns The track metadata, or null if no metadata could be found.
	 */
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
