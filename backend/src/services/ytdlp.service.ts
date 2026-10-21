import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import { detectProvider } from '../utils/url-validation.js';
import type { VideoMetadata, VideoFormat, DownloadJob } from '../types/video.js';

export const downloadJobs = new Map<string, DownloadJob>();

const EXTRA_BIN_DIR = 'C:\\ffmpeg-8.1.1-essentials_build\\bin';
const PYTHON_SCRIPTS = 'C:\\Users\\thehu\\AppData\Local\\Python\\pythoncore-3.14-64\\Scripts';
const NODE_BIN = 'C:\\Program Files\\nodejs';
const CHILD_ENV = {
  ...process.env,
  PATH: `${EXTRA_BIN_DIR};${PYTHON_SCRIPTS};${NODE_BIN};${process.env.PATH || ''}`
};

function formatTime(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatBytes(bytes?: number): string {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 100) || 'video';
}

export async function getYtDlpMetadata(url: string): Promise<VideoMetadata> {
  const provider = detectProvider(url);
  const args = [
    '--no-update',
    '--no-playlist',
    '--no-warnings',
    '--skip-download',
    '--dump-single-json',
    '--extractor-args', 'youtube:player_client=android,web',
    url
  ];

  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn('yt-dlp', args, {
      env: CHILD_ENV,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let out = '';
    let err = '';

    child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { err += d.toString(); });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Extracting video metadata timed out. Please try again.'));
    }, 45_000);

    child.on('error', (e) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to run yt-dlp: ${e.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && out.trim()) {
        resolve(out);
      } else {
        const errorMsg = err.split('\n').filter(Boolean).slice(-3).join(' ') || 'Could not fetch video details from this URL.';
        reject(new Error(errorMsg));
      }
    });
  });

  let raw: any;
  try {
    raw = JSON.parse(stdout);
  } catch {
    throw new Error('Received unexpected format from video inspector.');
  }

  const title = String(raw.title || 'Untitled Video');
  const duration = Number(raw.duration) || 0;
  const thumbnail = raw.thumbnail || (Array.isArray(raw.thumbnails) && raw.thumbnails.length > 0 ? raw.thumbnails[raw.thumbnails.length - 1]?.url : undefined);

  // Extract formats
  const rawFormats: any[] = Array.isArray(raw.formats) ? raw.formats : [];
  const videoFormats: VideoFormat[] = [];
  const heightsSeen = new Set<number>();

  const standardHeights = [2160, 1440, 1080, 720, 480, 360, 240];
  const availableHeights = new Set<number>();

  for (const f of rawFormats) {
    if (f.height && Number.isFinite(f.height) && f.vcodec !== 'none') {
      availableHeights.add(f.height);
    }
  }

  // Always offer Best Quality at top
  videoFormats.push({
    id: 'best',
    label: 'Best Available (MP4)',
    resolution: 'Auto High Definition',
    container: 'mp4',
    formatNote: 'Original Best',
    isAudio: false
  });

  const heightLabels: Record<number, string> = {
    2160: '4K Ultra HD (2160p)',
    1440: '2K Quad HD (1440p)',
    1080: 'Full HD (1080p)',
    720: 'HD (720p)',
    480: 'SD (480p)',
    360: 'Medium (360p)',
    240: 'Low (240p)'
  };

  // Find corresponding format for available standard heights
  for (const h of standardHeights) {
    const hasHeight = Array.from(availableHeights).some(ah => Math.abs(ah - h) <= 10 || (h <= 1080 && ah >= h));
    if (hasHeight && !heightSeen(h)) {
      heightsSeen.add(h);
      const match = rawFormats
        .filter(f => f.height && Math.abs(f.height - h) <= 20)
        .sort((a, b) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];

      const size = match?.filesize || match?.filesize_approx;
      videoFormats.push({
        id: `video-${h}`,
        label: heightLabels[h] || `${h}p`,
        resolution: `${h}p`,
        height: h,
        container: 'mp4',
        filesize: size,
        filesizeFormatted: size ? formatBytes(size) : undefined,
        isAudio: false
      });
    }
  }

  function heightSeen(h: number): boolean {
    return heightsSeen.has(h);
  }

  // Audio formats
  const audioFormats: VideoFormat[] = [
    {
      id: 'audio-mp3',
      label: 'Audio MP3 (High Quality)',
      resolution: 'Audio only',
      container: 'mp3',
      isAudio: true,
      formatNote: '320 kbps MP3'
    },
    {
      id: 'audio-m4a',
      label: 'Audio M4A (Original AAC)',
      resolution: 'Audio only',
      container: 'm4a',
      isAudio: true,
      formatNote: 'Original stream'
    }
  ];

  // Direct stream / embed computation
  const videoId = raw.id ? String(raw.id) : undefined;
  let embedUrl: string | undefined = undefined;
  if (provider === 'youtube' && videoId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (provider === 'vimeo' && videoId) {
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }

  const streamFormat = rawFormats.find((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.url && f.ext === 'mp4')
    || rawFormats.find((f: any) => f.vcodec !== 'none' && f.url && f.ext === 'mp4')
    || (raw.url ? { url: raw.url } : undefined);
  const streamUrl = streamFormat?.url ? String(streamFormat.url) : undefined;

  return {
    provider,
    url,
    videoId,
    embedUrl,
    streamUrl,
    title,
    description: raw.description ? String(raw.description).slice(0, 300) : undefined,
    thumbnail,
    duration,
    durationFormatted: formatTime(duration),
    uploader: raw.uploader || raw.channel || raw.creator || undefined,
    channel: raw.channel || raw.uploader || undefined,
    publishedAt: raw.upload_date || undefined,
    formats: videoFormats,
    audioFormats,
    capabilities: {
      metadata: true,
      thumbnail: Boolean(thumbnail),
      download: true,
      trim: true
    }
  };
}

export interface CreateDownloadParams {
  url: string;
  formatId?: string;
  quality?: number;
  audioOnly?: boolean;
  start?: string;
  end?: string;
}

export async function createDownloadJob(params: CreateDownloadParams): Promise<DownloadJob> {
  const { url, formatId, quality, audioOnly, start, end } = params;
  const id = randomUUID();
  const now = Date.now();

  const isAudio = Boolean(audioOnly || formatId?.startsWith('audio'));
  const targetExt = isAudio ? (formatId === 'audio-m4a' ? 'm4a' : 'mp3') : 'mp4';
  const outputTemplate = path.join(config.storageDir, `${id}.%(ext)s`);

  const job: DownloadJob = {
    id,
    url,
    title: 'Downloading media...',
    status: 'downloading',
    progress: 0,
    createdAt: now,
    expiresAt: now + config.retentionMs,
    formatLabel: isAudio ? 'Audio' : (quality ? `${quality}p MP4` : 'Best MP4')
  };

  downloadJobs.set(id, job);

  // Build yt-dlp arguments
  const args = [
    '--no-update',
    '--no-playlist',
    '--no-warnings',
    '--newline',
    '--extractor-args', 'youtube:player_client=android,web'
  ];

  if (isAudio) {
    if (formatId === 'audio-m4a') {
      args.push('-f', 'bestaudio[ext=m4a]/bestaudio/best', '-x', '--audio-format', 'm4a');
    } else {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    }
  } else {
    if (quality && Number.isFinite(quality) && quality > 0) {
      args.push('-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`, '--merge-output-format', 'mp4');
    } else {
      args.push('-f', 'bestvideo+bestaudio/best[ext=mp4]/best', '--merge-output-format', 'mp4');
    }
  }

  // Section trimming if requested
  if (start && end) {
    args.push('--download-sections', `*${start}-${end}`, '--force-keyframes-at-cuts');
  }

  args.push('-o', outputTemplate, url);

  // Spawn download process
  void (async () => {
    try {
      await fs.mkdir(config.storageDir, { recursive: true });

      const child = spawn('yt-dlp', args, {
        env: CHILD_ENV,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let errOutput = '';

      child.stdout.on('data', (d: Buffer) => {
        const text = d.toString();
        // Parse progress e.g. [download]  45.2% of ~  15.20MiB at   2.50MiB/s ETA 00:03
        const percentMatch = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/i);
        if (percentMatch && percentMatch[1]) {
          const val = parseFloat(percentMatch[1]);
          if (!isNaN(val)) {
            job.progress = Math.min(99, Math.max(job.progress, Math.floor(val)));
          }
        }
        const speedMatch = text.match(/at\s+([^\s]+)\s+ETA\s+([^\s]+)/i);
        if (speedMatch) {
          job.speed = speedMatch[1];
          job.eta = speedMatch[2];
        }
        if (text.includes('[Merger]') || text.includes('Extracting audio')) {
          job.status = 'processing';
          job.progress = 96;
        }
        if (text.includes('[info]') && text.includes(': Downloading')) {
          const titleMatch = text.match(/\[info\]\s+(.+?):\s+Downloading/);
          if (titleMatch && titleMatch[1]) {
            job.title = titleMatch[1];
          }
        }
      });

      child.stderr.on('data', (d: Buffer) => {
        errOutput += d.toString();
      });

      const maxWait = Math.max(120_000, config.maxDurationSeconds * 2000);
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
      }, maxWait);

      child.on('close', async (code) => {
        clearTimeout(timer);
        if (code === 0) {
          // Locate the generated file
          try {
            const files = await fs.readdir(config.storageDir);
            const found = files.find(f => f.startsWith(id));
            if (found) {
              const fullPath = path.join(config.storageDir, found);
              const stat = await fs.stat(fullPath);
              job.outputPath = fullPath;
              job.filesize = stat.size;
              job.filesizeFormatted = formatBytes(stat.size);
              job.filename = `${sanitizeFilename(job.title || 'video')}.${targetExt}`;
              job.status = 'completed';
              job.progress = 100;
              return;
            }
          } catch {}
          job.status = 'failed';
          job.error = 'Downloaded file could not be located.';
        } else {
          job.status = 'failed';
          job.error = errOutput.split('\n').filter(Boolean).slice(-2).join(' ') || 'Download failed.';
        }
      });
    } catch (e) {
      job.status = 'failed';
      job.error = e instanceof Error ? e.message : 'Processing failed';
    }
  })();

  return job;
}

export async function cleanupExpiredDownloads(): Promise<void> {
  const now = Date.now();
  for (const [id, job] of downloadJobs) {
    if (job.expiresAt < now || job.status === 'failed') {
      downloadJobs.delete(id);
      if (job.outputPath) {
        await fs.rm(job.outputPath, { force: true }).catch(() => {});
      }
    }
  }
}
