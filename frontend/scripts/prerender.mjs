import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const root = process.cwd();
const dist = path.join(root, 'dist');
const siteOrigin = process.env.VITE_SITE_URL?.trim().replace(/\/$/, '');
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
});

try {
  const [{ DownloaderPage }, { PLATFORMS }, { getSeoData }] = await Promise.all([
    vite.ssrLoadModule('/src/pages/DownloaderPage.tsx'),
    vite.ssrLoadModule('/src/platforms.ts'),
    vite.ssrLoadModule('/src/seo.ts')
  ]);
  const template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const pages = Object.values(PLATFORMS);
  const routes = [
    ...pages.map(config => ({ config, routePath: config.path })),
    { config: PLATFORMS.twitter, routePath: '/x-video-downloader' }
  ];

  for (const { config, routePath } of routes) {
    const rendered = renderToString(React.createElement(
      MemoryRouter,
      { initialEntries: [routePath] },
      React.createElement(DownloaderPage, { platform: config })
    ));
    const seo = getSeoData(config, siteOrigin || 'http://localhost:5173');
    const structuredData = siteOrigin ? seo.structuredData : {
      ...seo.structuredData,
      '@graph': seo.structuredData['@graph'].filter(item => ['FAQPage', 'HowTo'].includes(item['@type']))
    };
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const head = [
      `<title>${escapeHtml(seo.title)}</title>`,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
      '<meta name="twitter:card" content="summary" />',
      `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
      ...(siteOrigin ? [
        `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`,
        `<meta property="og:image" content="${escapeHtml(seo.ogImageUrl)}" />`,
        '<meta property="og:image:alt" content="Clipora video utility" />',
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`
      ] : []),
      `<script id="seo-jsonld" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`
    ].join('\n    ');
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/i, '')
      .replace(/<meta\s+(?:name|property)="(?:description|keywords|og:[^"]+|twitter:[^"]+)"[^>]*>/gi, '')
      .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
      .replace('</head>', `    ${head}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);
    const routeDirectory = routePath === '/' ? dist : path.join(dist, routePath.slice(1));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(path.join(routeDirectory, 'index.html'), html);
  }

  if (siteOrigin) {
    const urls = pages.map(config => `  <url><loc>${new URL(config.path, `${siteOrigin}/`).toString()}</loc></url>`).join('\n');
    await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);
  } else {
    await rm(path.join(dist, 'sitemap.xml'), { force: true });
    await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
    console.warn('VITE_SITE_URL is unset; sitemap generation is skipped and prerendered canonical URLs use localhost.');
  }
} finally {
  await vite.close();
}