import type { APIRoute, GetStaticPaths } from 'astro';
import { PLATFORMS } from '../platforms';

const site = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '');

export const getStaticPaths: GetStaticPaths = () => site ? [{ params: { filename: 'sitemap' } }] : [];

export const GET: APIRoute = () => {
  const paths = [
    ...Object.values(PLATFORMS).map(platform => platform.path),
    '/fair-use',
    '/terms-of-service',
    '/privacy-policy'
  ];
  const urls = paths.map(pagePath =>
    `  <url><loc>${new URL(pagePath, `${site}/`).toString()}</loc></url>`
  ).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};