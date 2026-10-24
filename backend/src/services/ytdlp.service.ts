import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ZipArchive } from 'archiver';
import { config } from '../config/env.js';
import { detectProvider } from '../utils/url-validation.js';
import type { VideoMetadata, VideoFormat, DownloadJob } from '../types/video.js';

export const downloadJobs = new Map<string, DownloadJob>();

const EXTRA_BIN_DIR = 'C:\\ffmpeg-8.1.1-essentials_build\\bin';
const PYTHON_SCRIPTS = 'C:\\Users\\thehu\\AppData\Local\\Python\\pythoncore-3.14-64\\Scripts';
const NODE_BIN = 'C:\\Program Files\\nodejs';
const platformToolDirs = process.platform === 'win32'
  ? [EXTRA_BIN_DIR, PYTHON_SCRIPTS, NODE_BIN]
  : [];
const CHILD_ENV = {
  ...process.env,
  PATH: [...platformToolDirs, process.env.PATH || ''].filter(Boolean).join(path.delimiter)
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

export function parseVttTranscript(vtt: string): string {
  return vtt
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('WEBVTT') && !line.startsWith('NOTE') && !/^\d+$/.test(line) && !line.includes('-->'))
    .map(line => line
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"))
    .join(' ');
}

export function parseEngagementCount(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}

export function parseTikTokCarouselUrls(output: string, limit = 20): string[] {
  const urls = new Set<string>();
  const allowedHosts = ['tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokcdn-eu.com', 'tiktokv.com', 'byteoversea.com', 'ibytedtos.com', 'byteimg.com'];
  for (const line of output.split(/\r?\n/)) {
    const candidate = line.trim();
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const allowedHost = allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
      if (url.protocol === 'https:' && !url.username && !url.password && allowedHost) urls.add(url.toString());
    } catch {
      continue;
    }
    if (urls.size >= limit) break;
  }
  return Array.from(urls);
}

async function getTikTokCarouselImages(url: string): Promise<{ url: string; index: number }[]> {
  const command = process.platform === 'win32' ? 'python.exe' : 'gallery-dl';
  const galleryArgs = [
    '--get-urls',
    '--no-download',
    '--range', '1-20',
    '--filesize-max', '10M',
    '--option', 'tiktok.photos=true',
    '--option', 'tiktok.videos=false',
    '--option', 'tiktok.audio=false',
    url
  ];
  const args = process.platform === 'win32' ? ['-m', 'gallery_dl', ...galleryArgs] : galleryArgs;

  return new Promise(resolve => {
    const child = spawn(command, args, {
      env: CHILD_ENV,
      shell: false,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    let output = '';
    let settled = false;
    const finish = (images: { url: string; index: number }[] = []) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(images);
    };
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      finish();
    }, 15_000);

    child.stdout.on('data', (chunk: Buffer) => {
      if (output.length < 64_000) output += chunk.toString();
    });
    child.once('error', () => finish());
    child.once('close', code => {
      finish(code === 0
        ? parseTikTokCarouselUrls(output).map((imageUrl, index) => ({ url: imageUrl, index: index + 1 }))
        : []);
    });
  });
}

export async function createCarouselArchive(
  workDirectory: string,
  imageFiles: string[],
  archivePath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(archivePath);
    const archive = new ZipArchive({ store: true });
    output.once('close', resolve);
    output.once('error', reject);
    archive.once('error', reject);
    archive.pipe(output);
    imageFiles.forEach((file, index) => {
      archive.file(path.join(workDirectory, file), {
        name: `image-${String(index + 1).padStart(2, '0')}${path.extname(file).toLowerCase()}`
      });
    });
    void archive.finalize().catch(reject);
  });
}

async function downloadTikTokCarousel(job: DownloadJob, url: string): Promise<void> {
  let workDirectory: string | undefined;
  try {
    workDirectory = await fs.mkdtemp(path.join(config.storageDir, 'carousel-'));
    job.workingDirectory = workDirectory;
    const command = process.platform === 'win32' ? 'python.exe' : 'gallery-dl';
    const galleryArgs = [
      '--destination', workDirectory,
      '--filename', 'image_{num}.{extension}',
      '--no-skip',
      '--no-part',
      '--range', '1-20',
      '--filesize-max', '10M',
      '--option', 'tiktok.photos=true',
      '--option', 'tiktok.videos=false',
      '--option', 'tiktok.audio=false',
      url
    ];
    const args = process.platform === 'win32' ? ['-m', 'gallery_dl', ...galleryArgs] : galleryArgs;
    job.progress = 5;

    const exitCode = await new Promise<number>((resolve, reject) => {
      const child = spawn(command, args, {
        env: CHILD_ENV,
        shell: false,
        stdio: ['ignore', 'ignore', 'pipe']
      });
      let errorOutput = '';
      child.stderr.on('data', (chunk: Buffer) => {
        if (errorOutput.length < 16_000) errorOutput += chunk.toString();
      });
      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error('Carousel extraction timed out. Try again later.'));
      }, 120_000);
      child.once('error', error => {
        clearTimeout(timeout);
        reject(new Error(`Could not start carousel extractor: ${error.message}`));
      });
      child.once('close', code => {
        clearTimeout(timeout);
        if (code === 0) resolve(code);
        else reject(new Error(errorOutput.split('\n').filter(Boolean).slice(-3).join(' ') || 'Could not retrieve carousel images.'));
      });
    });
    if (exitCode !== 0) throw new Error('Could not retrieve carousel images.');

    const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
    const imageFiles = (await fs.readdir(workDirectory))
      .filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
      .slice(0, 20);
    if (imageFiles.length === 0) throw new Error('No downloadable carousel images were found. The post may require access the service does not have.');

    job.progress = 75;
    job.status = 'processing';
    const archivePath = path.join(workDirectory, `clipora-carousel-${job.id}.zip`);
    await createCarouselArchive(workDirectory, imageFiles, archivePath);

    const stat = await fs.stat(archivePath);
    job.outputPath = archivePath;
    job.filename = `${sanitizeFilename(job.title || 'tiktok-carousel')}.zip`;
    job.filesize = stat.size;
    job.filesizeFormatted = formatBytes(stat.size);
    job.formatLabel = `ZIP (${imageFiles.length} images)`;
    job.status = 'completed';
    job.progress = 100;
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Could not create the carousel archive.';
    if (workDirectory) await fs.rm(workDirectory, { recursive: true, force: true }).catch(() => {});
    job.workingDirectory = undefined;
  }
}

export function parseYtDlpOutput(output: string): Record<string, any> {
  let raw: unknown;
  try {
    raw = JSON.parse(output);
  } catch {
    throw new Error('Received unexpected format from video inspector.');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('The video source did not return metadata. It may be unavailable or blocking this request.');
  }
  return raw as Record<string, any>;
}

export function getExtractionErrorMessage(provider: string, stderr: string): string {
  if (provider === 'tiktok' && /Unexpected response from webpage request|Unable to download webpage|curl: \(28\)|Connection timed out/i.test(stderr)) {
    return 'TikTok did not return video details for this link. The post may be unavailable or restricted, or TikTok may be temporarily blocking requests. Check that it is public and try again later.';
  }
  return stderr.split('\n').filter(Boolean).slice(-3).join(' ') || 'Could not fetch video details from this URL.';
}

async function getEnglishCaptions(url: string): Promise<string | undefined> {
  let captionsDir: string;
  try {
    captionsDir = await fs.mkdtemp(path.join(config.storageDir, 'captions-'));
  } catch {
    return undefined;
  }

  try {
    await new Promise<void>(resolve => {
      const child = spawn('yt-dlp', [
        '--no-update',
        '--no-playlist',
        '--no-warnings',
        '--ignore-errors',
        '--skip-download',
        '--write-subs',
        '--write-auto-subs',
        '--sub-langs', 'en',
        '--sub-format', 'vtt/best',
        '--output', path.join(captionsDir, '%(id)s.%(ext)s'),
        url
      ], {
        env: CHILD_ENV,
        shell: false,
        stdio: ['ignore', 'ignore', 'ignore']
      });

      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        resolve();
      }, 15_000);

      child.once('error', () => {
        clearTimeout(timeout);
        resolve();
      });
      child.once('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    const captionFile = (await fs.readdir(captionsDir)).find(file => file.endsWith('.vtt'));
    if (!captionFile) return undefined;
    const vtt = await fs.readFile(path.join(captionsDir, captionFile), 'utf8');
    if (vtt.length > 512_000) return undefined;
    return parseVttTranscript(vtt) || undefined;
  } catch {
    return undefined;
  } finally {
    await fs.rm(captionsDir, { recursive: true, force: true });
  }
}

export function buildVideoFormats(rawFormats: any[]): VideoFormat[] {
  const availableHeights = Array.from(new Set(rawFormats
    .filter(format => format.height && Number.isFinite(format.height) && format.height > 0 && format.vcodec !== 'none')
    .map(format => Number(format.height))));
  const requestedHeights = [1080, 720, 480];
  const heights = Array.from(new Set([
    ...availableHeights.filter(height => !requestedHeights.includes(height)),
    ...requestedHeights
  ])).sort((a, b) => b - a);
  const maxSourceHeight = Math.max(...availableHeights, 0);
  const heightLabels: Record<number, string> = {
    2160: '4K Ultra HD (2160p)',
    1440: '2K Quad HD (1440p)',
    1080: 'Full HD (1080p)',
    720: 'HD (720p)',
    480: 'SD (480p)',
    360: 'Medium (360p)',
    240: 'Low (240p)'
  };

  const formats: VideoFormat[] = [{
    id: 'best',
    label: 'Best Available (MP4)',
    resolution: 'Auto High Definition',
    container: 'mp4',
    formatNote: 'Original Best',
    isAudio: false
  }];

  for (const height of heights) {
    const match = rawFormats
      .filter(format => format.height && format.height <= height && format.vcodec !== 'none')
      .sort((a, b) => b.height - a.height || (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];
    const exactMatch = rawFormats
      .filter(format => format.height && Math.abs(format.height - height) <= 20 && format.vcodec !== 'none')
      .sort((a, b) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];
    const size = exactMatch?.filesize || exactMatch?.filesize_approx;

    formats.push({
      id: `video-${height}`,
      label: heightLabels[height] || `${height}p`,
      resolution: `Up to ${height}p`,
      height,
      container: 'mp4',
      filesize: size,
      filesizeFormatted: size ? formatBytes(size) : undefined,
      formatNote: maxSourceHeight && maxSourceHeight < height && match
        ? `Source maximum: ${match.height}p`
        : 'Highest available quality up to this resolution',
      isAudio: false
    });
  }

  return formats;
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

  let stdout: string;
  try {
    stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn('yt-dlp', args, {
        env: CHILD_ENV,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let out = '';
      let err = '';

      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error('Extracting video metadata timed out. Please try again.'));
      }, 45_000);

      child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
      child.stderr.on('data', (d: Buffer) => { err += d.toString(); });

      child.on('error', (e) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to run yt-dlp: ${e.message}`));
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0 && out.trim()) {
          resolve(out);
        } else {
          reject(new Error(getExtractionErrorMessage(provider, err)));
        }
      });
    });
  } catch (error) {
    throw error;
  }

  const raw = parseYtDlpOutput(stdout);
  const captions = await getEnglishCaptions(url);

  const title = String(raw.title || 'Untitled Video');
  const duration = Number(raw.duration) || 0;
  const thumbnail = raw.thumbnail || (Array.isArray(raw.thumbnails) && raw.thumbnails.length > 0 ? raw.thumbnails[raw.thumbnails.length - 1]?.url : undefined);

  // Extract formats
  const rawFormats: any[] = Array.isArray(raw.formats) ? raw.formats : [];
  const videoFormats = buildVideoFormats(rawFormats);
  const hasVideoStream = rawFormats.some(format => format.vcodec !== 'none' && format.height);
  const carouselImages = provider === 'tiktok' && !hasVideoStream
    ? await getTikTokCarouselImages(url)
    : [];

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
    description: raw.description ? String(raw.description) : undefined,
    thumbnail,
    duration,
    durationFormatted: formatTime(duration),
    uploader: raw.uploader || raw.channel || raw.creator || undefined,
    channel: raw.channel || raw.uploader || undefined,
    publishedAt: raw.upload_date || undefined,
    viewCount: parseEngagementCount(raw.view_count),
    likeCount: parseEngagementCount(raw.like_count),
    commentCount: parseEngagementCount(raw.comment_count),
    shareCount: parseEngagementCount(raw.repost_count ?? raw.share_count),
    mediaType: carouselImages.length ? 'carousel' : 'video',
    carouselImages: carouselImages.length ? carouselImages : undefined,
    captions: captions || undefined,
    captionLanguage: captions ? 'en' : undefined,
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
  carousel?: boolean;
  title?: string;
}

export async function createDownloadJob(params: CreateDownloadParams): Promise<DownloadJob> {
  const { url, formatId, quality, audioOnly, start, end, carousel, title } = params;
  const id = randomUUID();
  const now = Date.now();

  const isAudio = Boolean(audioOnly || formatId?.startsWith('audio'));
  const targetExt = carousel ? 'zip' : isAudio ? (formatId === 'audio-m4a' ? 'm4a' : 'mp3') : 'mp4';
  const outputTemplate = path.join(config.storageDir, `${id}.%(ext)s`);

  const job: DownloadJob = {
    id,
    url,
    title: title || 'Downloading media...',
    status: 'downloading',
    progress: 0,
    createdAt: now,
    expiresAt: now + config.retentionMs,
    formatLabel: carousel ? 'TikTok carousel ZIP' : isAudio ? 'Audio' : (quality ? `${quality}p MP4` : 'Best MP4')
  };

  downloadJobs.set(id, job);

  if (carousel) {
    void downloadTikTokCarousel(job, url);
    return job;
  }

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
      if (job.workingDirectory) {
        await fs.rm(job.workingDirectory, { recursive: true, force: true }).catch(() => {});
      }
    }
  }
}
