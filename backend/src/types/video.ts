export type Provider = 'youtube'|'instagram'|'tiktok'|'facebook'|'x'|'twitch'|'kick'|'reddit'|'vimeo'|'direct'|'unknown';
export interface VideoFormat { id: string; container: string; resolution?: string; label: string; }
export interface VideoMetadata {
  provider: Provider; url: string; title?: string; description?: string; thumbnail?: string; duration?: number;
  uploader?: string; publishedAt?: string; formats: VideoFormat[];
  capabilities: { metadata: boolean; thumbnail: boolean; preview: boolean; download: boolean; trim: boolean; requiresAuthentication: boolean };
  message?: string;
}
export type JobStatus = 'queued'|'processing'|'completed'|'failed'|'expired';
export interface ProcessingJob { id: string; status: JobStatus; progress?: number; createdAt: number; expiresAt: number; inputPath: string; outputPath?: string; originalName: string; error?: string; duration?: number; }
