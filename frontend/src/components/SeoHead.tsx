import { useEffect } from 'react';
import type { PlatformConfig } from '../platforms';

interface SeoHeadProps {
  config: PlatformConfig;
}

export function SeoHead({ config }: SeoHeadProps) {
  useEffect(() => {
    // Document title
    document.title = config.title;

    // Helper to update or create meta tags
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
    setMeta('keywords', config.keywords);
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.metaDescription, true);
    setMeta('og:url', window.location.href, true);
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.metaDescription);

    // Structured Data JSON-LD
    let scriptEl = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'seo-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: config.title,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          description: config.metaDescription
        },
        {
          '@type': 'FAQPage',
          mainEntity: config.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        },
        {
          '@type': 'HowTo',
          name: `How to download ${config.name} videos`,
          step: config.howToSteps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.title,
            text: step.description
          }))
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(structuredData);
  }, [config]);

  return null;
}
