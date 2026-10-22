import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const site = process.env.VITE_SITE_URL?.trim().replace(/\/$/, '');

export default defineConfig({
  integrations: [react()],
  site,
  trailingSlash: 'never'
});