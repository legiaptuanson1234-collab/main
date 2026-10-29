import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ }) => {
  // Astro 5+: SITE_URL = origin (hoặc undefined nếu chưa set), BASE_URL = path gốc.
  const site = import.meta.env.SITE_URL;
  const base = import.meta.env.BASE_URL || '/';
  const origin = site && site.trim() ? site : 'http://localhost:4321';
  const root = origin.replace(/\/$/, '') + (base.endsWith('/') ? base : base + '/');
  const body = `User-agent: *
Allow: /
Disallow: /data/

Sitemap: ${root}sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
