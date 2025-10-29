import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/data/blog';
import { DATA } from '@/data/resume';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all blog posts
  const posts = await getBlogPosts();
  
  // Create sitemap entries
  const routesMap = ['', '/blog'].map((route) => ({
    url: `${DATA.url}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  // Add blog posts to sitemap
  const postsMap = posts.map((post) => ({
    url: `${DATA.url}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt.split('T')[0], // Use post's published date
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routesMap, ...postsMap];
}