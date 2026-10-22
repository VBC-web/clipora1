import type { APIRoute } from 'astro';

const site = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '');

export const GET: APIRoute = () => new Response(
  `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ''}`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
);

export const prerender = true;