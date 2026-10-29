import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ }) => {
  const site = import.meta.env.SITE_URL || 'http://localhost:4321';
  const body = `User-agent: *
Allow: /
Disallow: /data/

Sitemap: ${site.replace(/\/$/, '')}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
