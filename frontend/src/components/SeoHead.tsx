import { useEffect } from 'react';
import type { PlatformConfig } from '../platforms';
import { getSeoData } from '../seo';

interface SeoHeadProps {
  config: PlatformConfig;
}

export function SeoHead({ config }: SeoHeadProps) {
  useEffect(() => {
    const siteOrigin = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '') || window.location.origin;
    const seo = getSeoData(config, siteOrigin);
    document.title = seo.title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', config.metaDescription);
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.metaDescription, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', seo.canonicalUrl, true);
    setMeta('og:image', seo.ogImageUrl, true);
    setMeta('og:image:alt', 'Clipora video utility', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.metaDescription);

    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = seo.canonicalUrl;

    let scriptEl = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'seo-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify(seo.structuredData).replace(/</g, '\\u003c');
  }, [config]);

  return null;
}
