export function ArticleSchema({ article }) {
  if (!article) return null;

  const baseUrl = 'https://rednewsbharat.live';
  const articleUrl = `${baseUrl}/news/${article.slug}`;
  
  // Clean description and truncate to 160 characters
  const cleanDescription = (article.excerpt || '').replace(/<[^>]*>?/gm, '').substring(0, 160);
  
  // Truncate headline if necessary (<110 characters for Google News strict compliance)
  const headline = (article.title || '').substring(0, 110);
  
  // Use cover image or fallback
  const ogImage = article.coverImage 
    ? (article.coverImage.startsWith('http') ? article.coverImage : `${baseUrl}${article.coverImage}`) 
    : `${baseUrl}/images/og-default.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: headline,
    description: cleanDescription,
    image: [ogImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person', // Could be 'Organization' if no specific author
      name: article.authorName || 'RED NEWS BHARAT',
      url: baseUrl, // Optional, could point to author profile
    },
    publisher: {
      '@type': 'Organization',
      name: 'RED NEWS BHARAT',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
