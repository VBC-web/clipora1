export type Provider = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'x' | 'twitch' | 'kick' | 'reddit' | 'vimeo' | 'pinterest' | 'threads' | 'direct' | 'unknown';

export interface VideoFormat {
  id: string;
  label: string;
  resolution?: string;
  height?: number;
  container: string;
  filesize?: number;
  filesizeFormatted?: string;
  isAudio?: boolean;
  formatNote?: string;
  fps?: number;
}

export interface VideoMetadata {
  provider: Provider;
  url: string;
  videoId?: string;
  embedUrl?: string;
  streamUrl?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  uploader?: string;
  channel?: string;
  publishedAt?: string;
  captions?: string;
  captionLanguage?: string;
  formats: VideoFormat[];
  audioFormats: VideoFormat[];
  capabilities: {
    metadata: boolean;
    thumbnail: boolean;
    download: boolean;
    trim: boolean;
  };
  message?: string;
}

export type JobStatus = 'queued' | 'downloading' | 'processing' | 'completed' | 'failed' | 'expired';

export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  status: JobStatus;
  progress: number;
  speed?: string;
  eta?: string;
  createdAt: number;
  expiresAt: number;
  outputPath?: string;
  filename?: string;
  filesize?: number;
  filesizeFormatted?: string;
  error?: string;
  formatLabel?: string;
  start?: number;
  end?: number;
}
