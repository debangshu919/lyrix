export interface TrackMetadata {
  trackId: string;
  trackName: string;
  artists: string;
  duration?: number;
}

export interface LyricMetadata {
  lyricId: string;
  trackId: string;
  text: string;
  provider: string;
}

export interface TranslationMetadata {
  translationId: string;
  lyricId: string;
  provider: string;
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
}
