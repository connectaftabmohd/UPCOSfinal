/**
 * SEO Management Utility for UP Outsource Seva Nigam
 * Dynamically manages document title, meta descriptions, OpenGraph, Twitter cards,
 * canonical & hreflang links, and Schema.org JSON-LD structured data.
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
  noindex?: boolean;
  robots?: string;
  structuredData?: Record<string, unknown>;
}

const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/og-banner.jpg`;

export function resolveAbsoluteImageUrl(img?: string): string {
  if (!img || !img.trim()) return DEFAULT_OG_IMAGE;
  const trimmed = img.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_DOMAIN}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export function updatePageSEO(config: SEOConfig): void {
  // 1. Update Document Title
  const baseTitle = 'UP Outsource Seva Nigam';
  const fullTitle =
    config.title.includes(baseTitle) || config.title.includes('UPCOS')
      ? config.title
      : `${config.title} | ${baseTitle}`;
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

  const removeMetaTag = (attribute: string, attributeValue: string) => {
    const element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (element) element.remove();
  };

  // 3. Robots / Indexing Control
  const robotsValue = config.robots || (config.noindex ? 'noindex, nofollow' : DEFAULT_ROBOTS);
  setMetaTag('name', 'robots', robotsValue);
  setMetaTag('name', 'googlebot', config.noindex ? 'noindex, nofollow' : 'index, follow');

  // 4. Primary Meta Tags
  setMetaTag('name', 'description', config.description);
  setMetaTag('name', 'title', fullTitle);
  if (config.keywords && config.keywords.length > 0) {
    setMetaTag('name', 'keywords', config.keywords.join(', '));
  }

  // 5. OpenGraph Tags
  const currentUrl = config.canonicalUrl || getCanonicalUrl(window.location.pathname);
  const ogImage = resolveAbsoluteImageUrl(config.image);

  setMetaTag('property', 'og:site_name', 'UP Outsource Seva Nigam');
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:type', config.ogType || 'website');
  setMetaTag('property', 'og:image', ogImage);
  setMetaTag('property', 'og:image:secure_url', ogImage);
  setMetaTag('property', 'og:image:alt', fullTitle);
  setMetaTag('property', 'og:url', currentUrl);

  const effectivePublishTime = config.publishedTime || '2026-11-26T09:30:00+05:30';
  const effectivePublishDate = effectivePublishTime.slice(0, 10);
  setMetaTag('name', 'publish_date', effectivePublishDate);
  setMetaTag('name', 'date', effectivePublishDate);
  setMetaTag('property', 'article:published_time', effectivePublishTime);
  setMetaTag('property', 'article:modified_time', effectivePublishTime);
  setMetaTag('property', 'og:updated_time', effectivePublishTime);
  if (config.author) {
    setMetaTag('name', 'author', config.author);
  }

  if (ogImage === DEFAULT_OG_IMAGE) {
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:width', '1376');
    setMetaTag('property', 'og:image:height', '768');
  } else {
    removeMetaTag('property', 'og:image:type');
    removeMetaTag('property', 'og:image:width');
    removeMetaTag('property', 'og:image:height');
  }

  // 6. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', config.description);
  setMetaTag('name', 'twitter:image', ogImage);
  setMetaTag('name', 'twitter:image:alt', fullTitle);
  setMetaTag('name', 'twitter:url', currentUrl);

  // 7. Canonical & Hreflang Link Tags
  const setLinkTag = (rel: string, href: string, extraAttr?: [string, string]) => {
    const selector = extraAttr
      ? `link[rel="${rel}"][${extraAttr[0]}="${extraAttr[1]}"]`
      : `link[rel="${rel}"]`;
    let linkEl = document.querySelector(selector) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', rel);
      if (extraAttr) linkEl.setAttribute(extraAttr[0], extraAttr[1]);
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', href);
  };

  setLinkTag('canonical', currentUrl);
  if (!config.noindex) {
    setLinkTag('alternate', currentUrl, ['hreflang', 'hi-IN']);
    setLinkTag('alternate', currentUrl, ['hreflang', 'x-default']);
  }

  // 8. Dynamic JSON-LD Structured Data
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

export interface JobPostingJsonLdInput {
  identifier?: string;
  title: string;
  description: string;
  hiringOrganization: string;
  sameAs?: string;
  locality: string;
  region?: string;
  country?: string;
  salaryValue: number;
  salaryMinValue?: number;
  salaryMaxValue?: number;
  salaryCurrency?: string;
  salaryUnit?: 'MONTH' | 'YEAR' | 'DAY' | 'HOUR';
  datePosted?: string;
  validThrough: string;
  employmentType?: string;
  qualifications?: string;
  experienceRequirements?: string;
}

export function buildJobPostingJsonLd(
  job: JobPostingJsonLdInput,
  options: {
    articleId: string;
    articleSlug: string;
    publicationDate: string;
    sourceUrl?: string;
    index: number;
  }
): Record<string, unknown> {
  const canonicalHref = getCanonicalUrl(`/news/${options.articleSlug}`);
  const hasSalaryRange =
    typeof job.salaryMinValue === 'number' &&
    typeof job.salaryMaxValue === 'number' &&
    job.salaryMaxValue > job.salaryMinValue;

  const baseSalaryValue: Record<string, unknown> = hasSalaryRange
    ? {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMinValue,
        maxValue: job.salaryMaxValue,
        unitText: job.salaryUnit || 'MONTH'
      }
    : {
        '@type': 'QuantitativeValue',
        value: job.salaryValue,
        unitText: job.salaryUnit || 'MONTH'
      };

  return {
    '@type': 'JobPosting',
    '@id': `${canonicalHref}#job-${job.identifier || options.index + 1}`,
    title: job.title,
    description: job.description,
    url: canonicalHref,
    directApply: false,
    identifier: {
      '@type': 'PropertyValue',
      name: 'UP Sewayojan Outsource',
      value: job.identifier || `${options.articleId}-${options.index + 1}`
    },
    datePosted: job.datePosted || options.publicationDate,
    validThrough: job.validThrough,
    employmentType: job.employmentType || 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.hiringOrganization,
      sameAs: job.sameAs || options.sourceUrl || 'https://sewayojan.up.nic.in',
      logo: `${SITE_DOMAIN}/logo.png`
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.locality,
        addressRegion: job.region || 'Uttar Pradesh',
        addressCountry: job.country || 'IN'
      }
    },
    applicantLocationRequirements: {
      '@type': 'State',
      name: job.region || 'Uttar Pradesh'
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || 'INR',
      value: baseSalaryValue
    },
    ...(job.qualifications ? { qualifications: job.qualifications } : {}),
    ...(job.experienceRequirements ? { experienceRequirements: job.experienceRequirements } : {})
  };
}
