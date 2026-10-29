import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export const GET = async (ctx: APIContext) => {
  const guides = (await getCollection('guides', (g) => g.data.status === 'published')).sort(
    (a, b) => b.data.createdAt.localeCompare(a.data.createdAt)
  );
  return rss({
    title: 'Sổ Tay AI',
    description: 'Hướng dẫn dùng AI miễn phí, kiểm chứng được.',
    site: ctx.site ?? 'http://localhost:4321',
    items: guides.map((g) => ({
      title: g.data.title,
      description: g.data.description,
      pubDate: new Date(g.data.createdAt),
      link: `/guides/${g.data.slug ?? g.id}/`,
      categories: [g.data.topic],
    })),
  });
};
