import { MusicBrainzApi} from 'musicbrainz-api';
import type { Track } from '../../providers/provider';
import type { TrackMetadata } from '../../types/metadata';

const mbApi = new MusicBrainzApi({
    appName: 'lyrix',
    appVersion: '0.1.0',
    appContactInfo: 'debangshudas63yt@gmail.com',
});

export class MetadataService {
  private static async getTrackMetadataFromIsrc(isrc: string): Promise<TrackMetadata | null> {
    const result = await mbApi.search("recording", {
      query: `isrc:${isrc}`,
    });
    if (result.recordings.length === 0) return null;
    const recording = result.recordings[0]!;
    return {
      trackId: recording.id,
      trackName: recording.title,
      artists: recording['artist-credit']?.map(a => a.name).join(', ') ?? "",
      duration: recording.length,
    } satisfies TrackMetadata;
  }

  private static async getTrackMetadataFromUrl(url: string): Promise<TrackMetadata | null> {
    const entity = await mbApi.lookupUrl(url);

    const recordingId = entity.relations
      ?.find(r => r.recording)
      ?.recording?.id;

    if (!recordingId) return null;

    const recording = await mbApi.lookup("recording", recordingId, [
      "artists",
      "releases",
    ]);

    return {
      trackId: recording.id,
      trackName: recording.title,
      artists: recording["artist-credit"]
        ?.map(a => a.name)
        .join(", ") ?? "",
      duration: recording.length,
    } satisfies TrackMetadata;
  }

  private static async getTrackMetadataFromArtisNameAndTrackName(trackName: string, artistName: string): Promise<TrackMetadata | null> {
    const result = await mbApi.search("recording", {
      query: `recording:${trackName} AND artist:${artistName}`,
    });
    if (result.recordings.length === 0) return null;
    const recording = result.recordings[0]!;
    return {
      trackId: recording.id,
      trackName: recording.title,
      artists: recording['artist-credit']?.map(a => a.name).join(', ') ?? "",
      duration: recording.length,
    } satisfies TrackMetadata;
  }

  private static async getTrackMetadataFromTrackName(trackName: string): Promise<TrackMetadata | null> {
    const result = await mbApi.search("recording", {
      query: `recording:${trackName}`,
    });
    if (result.recordings.length === 0) return null;
    const recording = result.recordings[0]!;
    return {
      trackId: recording.id,
      trackName: recording.title,
      artists: recording['artist-credit']?.map(a => a.name).join(', ') ?? "",
      duration: recording.length,
    } satisfies TrackMetadata;
  }

  /*
   * Gets the track metadata based on the provided track info.
   * @param trackInfo - The track info to get the metadata for.
   * @returns The track metadata, or null if no metadata could be found.
   */
  public static async getTrackMetadata(trackInfo: Track): Promise<TrackMetadata | null> {
      if (trackInfo.isrc) {
        return this.getTrackMetadataFromIsrc(trackInfo.isrc);
      }
      if (trackInfo.trackName && trackInfo.artistName) {
        return this.getTrackMetadataFromArtisNameAndTrackName(trackInfo.trackName, trackInfo.artistName);
      }
      if (trackInfo.trackName) {
        return this.getTrackMetadataFromTrackName(trackInfo.trackName);
      }
      if (trackInfo.url) {
        return this.getTrackMetadataFromUrl(trackInfo.url);
      }
      return null;
    }
}
