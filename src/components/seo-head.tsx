import { DATA } from '@/data/resume';

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

const SEOHead = ({
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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const fullUrl = url || `${DATA.url}${pathname}`;
  const fullTitle = title ? `${title} | ${DATA.name}` : DATA.name;
  const fullDescription = description || DATA.description;
  const fullImage = image || `${DATA.url}/og?title=${encodeURIComponent(title || DATA.name)}`;
  const siteKeywords = keywords?.join(', ') || [...DATA.skills, 'portfolio', 'software engineer', 'developer'].join(', ');

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content={DATA.name} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={DATA.name} />
      {type === 'article' && author && (
        <meta property="og:article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="og:article:published_time" content={publishedTime} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content={`@${DATA.name.replace(/\s+/g, '')}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </>
  );
};

export default SEOHead;