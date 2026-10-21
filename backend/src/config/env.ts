import path from 'node:path';
export const config = {
  port: Number(process.env.PORT || 4000),
  production: process.env.NODE_ENV === 'production',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  maxUploadBytes: Math.max(1, Number(process.env.MAX_UPLOAD_MB || 250)) * 1024 * 1024,
  maxDurationSeconds: Math.max(1, Number(process.env.MAX_DURATION_SECONDS || 3600)),
  maxConcurrentJobs: Math.max(1, Number(process.env.MAX_CONCURRENT_JOBS || 2)),
  retentionMs: Math.max(1, Number(process.env.JOB_RETENTION_MINUTES || 60)) * 60_000,
  storageDir: path.resolve(process.env.STORAGE_DIR || './storage'),
};
