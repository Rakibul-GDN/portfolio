'use client';

import { usePathname } from 'next/navigation';
import { DATA } from '@/data/resume';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  keywords?: string[];
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author = DATA.name,
  keywords,
  noIndex = false,
}: SEOProps) => {
  const pathname = usePathname();
  
  const fullUrl = url || `${DATA.url}${pathname}`;
  const fullTitle = title ? `${title} | ${DATA.name}` : DATA.name;
  const fullDescription = description || DATA.description;
  const fullImage = image || `${DATA.url}/og?title=${encodeURIComponent(title || DATA.name)}`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, property: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;

      // Also add property version for Open Graph
      let ogElement = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!ogElement) {
        ogElement = document.createElement('meta');
        ogElement.setAttribute('property', property);
        document.head.appendChild(ogElement);
      }
      ogElement.content = content;
    };

    updateMetaTag('description', 'og:description', fullDescription);
    updateMetaTag('keywords', 'article:tag', keywords?.join(', ') || DATA.skills.join(', '));
    
    // Update Open Graph tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMetaTag('og:url', fullUrl);
    setMetaTag('og:type', type);
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', fullDescription);
    setMetaTag('og:image', fullImage);
    setMetaTag('og:site_name', DATA.name);
    
    if (type === 'article') {
      setMetaTag('article:author', author);
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime);
      }
    }

    // Twitter Card tags
    const setTwitterTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = `twitter:${name}`;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setTwitterTag('title', fullTitle);
    setTwitterTag('description', fullDescription);
    setTwitterTag('image', fullImage);
    setTwitterTag('card', type === 'article' ? 'summary_large_image' : 'summary_large_image');
    setTwitterTag('site', `@${DATA.name.replace(/\s+/g, '')}`);

    // Set robots meta tag if needed
    if (noIndex) {
      let robotsElement = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (!robotsElement) {
        robotsElement = document.createElement('meta');
        robotsElement.name = 'robots';
        document.head.appendChild(robotsElement);
      }
      robotsElement.content = 'noindex, nofollow';
    }
  }, [fullTitle, fullDescription, fullImage, fullUrl, type, publishedTime, author, keywords, noIndex]);

  return null;
};

export default SEO;