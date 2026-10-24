import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs/promises';
import { config } from './config/env.js';
import { detectProvider, parseHttpUrl } from './utils/url-validation.js';
import { errorHandler } from './middleware/error-handler.js';
import {
  getYtDlpMetadata,
  createDownloadJob,
  downloadJobs,
  cleanupExpiredDownloads
} from './services/ytdlp.service.js';

export const app = express();
await fs.mkdir(config.storageDir, { recursive: true });

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: config.frontendOrigin.split(',').map(x => x.trim()),
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '64kb' }));
app.use('/api', rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false
}));

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'clipora-api',
    ytdlp: true,
    ffmpeg: true
  });
});

// Video metadata inspection
app.post('/api/metadata', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) {
    return res.status(400).json({ error: 'Please enter a video URL.' });
  }

  try {
    parseHttpUrl(url);
    const data = await getYtDlpMetadata(url);
    res.json(data);
  } catch (e) {
    res.status(400).json({
      error: e instanceof Error ? e.message : 'Could not inspect this video link.'
    });
  }
});

// Start download job
// Streaming video proxy endpoint (for HTML5 online video player)
app.get('/api/stream', async (req, res) => {
  const target = String(req.query.url || '').trim();
  if (!target) return res.status(400).send('Target video URL is required.');
  try {
    const parsed = new URL(target);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).send('Invalid URL');
    }
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
    };
    if (req.headers.range) {
      headers['Range'] = String(req.headers.range);
    }
    const remoteRes = await fetch(parsed.toString(), {
      headers,
      signal: AbortSignal.timeout(30_000)
    });
    res.status(remoteRes.status);
    for (const [key, val] of remoteRes.headers.entries()) {
      const lower = key.toLowerCase();
      if (['content-type', 'content-length', 'content-range', 'accept-ranges'].includes(lower)) {
        res.setHeader(key, val);
      }
    }
    if (remoteRes.body) {
      const { Readable } = await import('node:stream');
      // @ts-ignore
      Readable.fromWeb(remoteRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).send(err?.message || 'Streaming error');
    }
  }
});

app.post('/api/download', async (req, res) => {
  const { url, formatId, quality, audioOnly, start, end, carousel, title } = req.body || {};
  const trimmedUrl = String(url || '').trim();
  if (!trimmedUrl) {
    return res.status(400).json({ error: 'Video URL is required.' });
  }

  try {
    parseHttpUrl(trimmedUrl);
    if (carousel && detectProvider(trimmedUrl) !== 'tiktok') {
      throw new Error('Carousel downloads are currently available for TikTok photo posts only.');
    }
    const job = await createDownloadJob({
      url: trimmedUrl,
      formatId,
      quality: quality ? Number(quality) : undefined,
      audioOnly: Boolean(audioOnly),
      carousel: Boolean(carousel),
      title: title ? String(title).slice(0, 160) : undefined,
      start: start ? String(start).trim() : undefined,
      end: end ? String(end).trim() : undefined
    });
    res.status(202).json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      formatLabel: job.formatLabel
    });
  } catch (e) {
    res.status(400).json({
      error: e instanceof Error ? e.message : 'Could not initiate video download.'
    });
  }
});

// Check download status
app.get('/api/download/status/:jobId', (req, res) => {
  const jobId = String(req.params.jobId || '');
  const job = downloadJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'This download job was not found or has expired.' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    speed: job.speed,
    eta: job.eta,
    title: job.title,
    filename: job.filename,
    filesizeFormatted: job.filesizeFormatted,
    error: job.error
  });
});

// Download the finished file
const handleFileDownload = (req: express.Request, res: express.Response) => {
  const jobId = String(req.params.jobId || '');
  const job = downloadJobs.get(jobId);
  if (!job || job.status !== 'completed' || !job.outputPath) {
    return res.status(404).json({
      error: 'The downloaded file is not ready yet or has expired.'
    });
  }

  res.download(job.outputPath, job.filename || `clipora-${job.id}.mp4`);
};

app.get('/api/download/file/:jobId', handleFileDownload);
app.get('/api/downloads/:jobId', handleFileDownload);

// Delete job manually
app.delete('/api/download/:jobId', async (req, res) => {
  const jobId = String(req.params.jobId || '');
  const job = downloadJobs.get(jobId);
  if (!job) return res.status(204).end();
  downloadJobs.delete(job.id);
  if (job.outputPath) {
    await fs.rm(job.outputPath, { force: true }).catch(() => {});
  }
  if (job.workingDirectory) {
    await fs.rm(job.workingDirectory, { recursive: true, force: true }).catch(() => {});
  }
  res.status(204).end();
});

app.use(errorHandler);

setInterval(() => void cleanupExpiredDownloads(), 5 * 60_000).unref();
