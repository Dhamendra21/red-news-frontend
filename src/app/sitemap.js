export default async function sitemap() {
  const baseUrl = 'https://rednewsbharat.live';

  // Define static routes
  const staticRoutes = [
    '',
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Define categories
  const categories = ['chhattisgarh', 'national', 'politics', 'crime', 'entertainment'].map(
    (cat) => ({
      url: `${baseUrl}/category/${cat}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.8,
    })
  );

  // In a real application, fetch the latest 200+ articles from the database
  const articlesCount = 200;
  const articles = Array.from({ length: articlesCount }).map((_, i) => {
    const isNew = i < 20; // Assume first 20 are under 48 hours old for demonstration
    return {
      url: `${baseUrl}/news/article-slug-${i}`, // Replace with real slug
      lastModified: new Date(Date.now() - i * 3600000).toISOString(), // Mock published time
      changeFrequency: isNew ? 'hourly' : 'daily',
      priority: 0.9,
    };
  });

  return [...staticRoutes, ...categories, ...articles];
}
