/**
 * SEO Management Utility for UP Outsource Seva Nigam
 * Dynamically manages document title, meta descriptions, OpenGraph, Twitter cards,
 * canonical links, and Schema.org JSON-LD structured data.
 */

export const SITE_DOMAIN = (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? window.location.origin 
  : (((import.meta as any).env && (import.meta as any).env.VITE_SITE_URL) || 'https://upcos.netlify.app')).replace(/\/+$/, '');

export function getCanonicalUrl(pathname: string): string {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_DOMAIN}${clean.split('?')[0].split('#')[0]}`;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  image?: string;
  publishedTime?: string;
  author?: string;
  structuredData?: Record<string, unknown>;
}

export function updatePageSEO(config: SEOConfig): void {
  // 1. Update Document Title
  const baseTitle = 'UP Outsource Seva Nigam';
  const fullTitle = config.title.includes(baseTitle) ? config.title : `${config.title} | ${baseTitle}`;
  document.title = fullTitle;

  // 2. Helper to set or create meta tag
  const setMetaTag = (attribute: string, attributeValue: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Primary Meta Tags
  setMetaTag('name', 'description', config.description);
  setMetaTag('name', 'title', fullTitle);
  if (config.keywords && config.keywords.length > 0) {
    setMetaTag('name', 'keywords', config.keywords.join(', '));
  }

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:type', config.ogType || 'website');
  if (config.image) {
    setMetaTag('property', 'og:image', config.image);
  }
  const currentUrl = config.canonicalUrl || getCanonicalUrl(window.location.pathname);
  setMetaTag('property', 'og:url', currentUrl);

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', config.description);
  if (config.image) {
    setMetaTag('name', 'twitter:image', config.image);
  }

  // 6. Canonical Link Tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', currentUrl);

  // 7. Dynamic JSON-LD Structured Data
  const existingDynamicSchema = document.getElementById('dynamic-jsonld-schema');
  if (existingDynamicSchema) {
    existingDynamicSchema.remove();
  }

  if (config.structuredData) {
    const script = document.createElement('script');
    script.id = 'dynamic-jsonld-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(config.structuredData);
    document.head.appendChild(script);
  }
}
