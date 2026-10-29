// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL: gốc domain (origin), KHÔNG kèm path. Ví dụ: https://user.github.io
// BASE_PATH: path gốc khi deploy dưới sub-path (GitHub Pages repo = /ten-repo/).
// Astro tự ghép: URL trang = SITE_URL + BASE_PATH + /duong-dan/
// (liên kết nội bộ, asset, sitemap, canonical đều được viết lại theo base này).
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
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
