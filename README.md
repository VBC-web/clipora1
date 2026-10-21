# Clipora

Clipora is a responsive video utility with a React/Vite frontend and Express/FFmpeg backend. It supports metadata inspection and trimming for user-uploaded videos. Remote social-platform links are identified honestly; provider-specific downloading is not enabled by default. Direct remote media inspection is guarded by URL/IP checks, and remote trimming is intentionally not enabled until a source-specific, permitted integration is configured.

## Requirements
- Node.js 20+ (tested with Node 22)
- npm 10+
- FFmpeg and FFprobe available on `PATH`

## Local development
```bash
cp backend/.env.example backend/.env
npm install
npm run dev
```
Frontend: http://localhost:5173. API: http://localhost:4000/api/health.

## Checks
```bash
npm test
npm run build
```

## Environment
See `backend/.env.example`. `FRONTEND_ORIGIN` should be the exact production frontend origin. Keep API secrets server-side. Uploads and output files are temporary and removed by cleanup; this starter does not use a database or accounts. Job IDs are unguessable random identifiers, but this is not a substitute for authenticated ownership in a public multi-user deployment.

## Deploying
Build the frontend with `npm run build -w frontend` and publish `frontend/dist` as static files. Deploy `backend` to a Node.js runtime with FFmpeg/FFprobe installed, writable temporary storage, sufficient disk/RAM, and persistent process support. Set `VITE_API_BASE_URL` at frontend build time to the HTTPS backend origin (without trailing slash), and set `FRONTEND_ORIGIN` on the backend. Configure HTTPS and restrictive CORS at the host/reverse proxy. Run `npm install --omit=dev` and `npm run start -w backend` for the backend after building it (`npm run build -w backend`). Do not assume a Hostinger plan supports Node.js apps, FFmpeg binaries, or long-running jobs; verify those capabilities in hPanel. If unavailable, use Hostinger for static frontend hosting and a separate Node-capable host for the API.

## Current provider support
- Upload: media inspection and FFmpeg trimming are implemented.
- Direct video URL: recognized; safe remote metadata inspection is limited and no remote URL is sent to FFmpeg. Remote trimming/download requires a dedicated approved source integration.
- YouTube, Instagram, TikTok, Facebook, X, Twitch, Kick, Reddit, Vimeo: identified for useful unsupported/authentication responses; no downloader is falsely advertised. Add official API credentials/adapters as permitted.

This project does not bypass DRM, authentication, privacy settings, or access controls. Only process content you own or are authorized to use.

## Before public launch
Replace the example sitemap URL and configure a canonical URL for your real domain. Review and publish privacy, terms, copyright/acceptable-use, and contact information for your actual operation; the frontend includes initial explanatory notices but is not a substitute for reviewed legal pages. Configure authenticated job ownership if multiple users will share a public API, and consider object storage/queue infrastructure for sustained production workloads. SSRF controls validate DNS results and every redirect before HEAD inspection, but high-risk deployments should additionally pin outbound connections to validated IP addresses to fully mitigate DNS rebinding.
