import type { MetadataRoute } from 'next';
import { env } from '@/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.APP_URL;
  const pages = ['', '/about', '/contact', '/terms', '/privacy', '/login'];
  const now = new Date();

  return pages.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
