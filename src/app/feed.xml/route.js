import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://rednewsbharat.live';
  
  // In a real application, fetch the latest 30 articles from your database
  const articles = Array.from({ length: 30 }).map((_, i) => ({
    title: `Sample News Title ${i}`,
    slug: `sample-news-title-${i}`,
    excerpt: `This is a sample description for news article ${i} which will be processed for the RSS feed without HTML tags.`,
    content: `<p>Full HTML content of news article ${i}...</p>`,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(), // Mock times in ISO 8601
  }));

  let rssItems = '';
  
  articles.forEach((article) => {
    const itemUrl = `${baseUrl}/news/${article.slug}`;
    // Strip raw HTML tags from the excerpt when generating plain-text descriptions
    const cleanDescription = (article.excerpt || '').replace(/<[^>]*>?/gm, '');
    const pubDate = new Date(article.publishedAt).toUTCString();
    
    rssItems += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${cleanDescription}]]></description>
      <content:encoded><![CDATA[${article.content}]]></content:encoded>
    </item>`;
  });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RED NEWS BHARAT - देश का सबसे तेज हिंदी समाचार</title>
    <link>${baseUrl}</link>
    <description>सत्य और साहस की पत्रकारिता। RED NEWS BHARAT पर पाएं ब्रेकिंग हिंदी न्यूज़, प्रादेशिक खबरें, राजनीति, योजनाएं और वायरल अपडेट्स सबसे तेज़।</description>
    <language>hi-IN</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
