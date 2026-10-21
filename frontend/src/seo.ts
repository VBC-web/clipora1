import type { PlatformConfig } from './platforms';

export function getSeoData(config: PlatformConfig, siteOrigin: string) {
  const canonicalUrl = new URL(config.path, `${siteOrigin.replace(/\/$/, '')}/`).toString();

  return {
    title: config.title,
    description: config.metaDescription,
    canonicalUrl,
    ogImageUrl: new URL('/og-image.svg', canonicalUrl).toString(),
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Clipora',
          url: new URL('/', canonicalUrl).toString()
        },
        {
          '@type': 'WebApplication',
          name: 'Clipora',
          url: canonicalUrl,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
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
          name: `How to use Clipora for ${config.name} videos`,
          step: config.howToSteps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.title,
            text: step.description
          }))
        }
      ]
    }
  };
}