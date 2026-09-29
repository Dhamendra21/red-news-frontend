export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/news/', '/category/', '/uploads/'],
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://rednewsbharat.live/sitemap.xml',
  };
}
