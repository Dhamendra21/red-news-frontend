// Server Component — handles SEO/OG metadata for WhatsApp, Twitter, Google
// The actual UI is rendered by NewsDetailClient (client component below)
import NewsDetailClient from './NewsDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.rednewsbharat.live/api';

// Fetch news by slug on the server side
async function getNewsBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/news/${slug}`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || data?.news || null;
  } catch {
    return null;
  }
}

// ✅ This is what WhatsApp/Google reads — runs on the SERVER before page load
export async function generateMetadata({ params }) {
  const { slug } = params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: 'खबर नहीं मिली | RED NEWS BHARAT',
      description: 'यह खबर उपलब्ध नहीं है।',
    };
  }

  // Pick the first image (cover image) from the news article
  const coverImage =
    news.images?.find((img) => img.isMain)?.url ||
    news.images?.[0]?.url ||
    'https://rednewsbharat.live/og-default.jpg';

  const title = news.metaTitle || news.title;
  const description =
    news.metaDescription || news.summary || 'RED NEWS BHARAT पर पढ़ें ताज़ा हिंदी खबरें।';
  const url = `https://rednewsbharat.live/news/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'RED NEWS BHARAT',
      locale: 'hi_IN',
      type: 'article',
      publishedTime: news.createdAt,
      modifiedTime: news.updatedAt,
      authors: [news.authorName || 'RED NEWS BHARAT'],
      // ✅ This is what WhatsApp uses to show the cover image
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    // WhatsApp uses Twitter Card as fallback
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
    },
  };
}

// Server page component — just renders the client UI
export default function NewsDetailPage() {
  return <NewsDetailClient />;
}
