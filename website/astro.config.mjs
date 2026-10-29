// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL có thể đặt từ biến môi trường (Cloudflare Pages, .env).
const site = process.env.SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/data/'),
    }),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
