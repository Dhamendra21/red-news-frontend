import { ArticleSchema } from '@/components/seo/ArticleSchema';

export async function generateMetadata({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rednewsbharat.live';
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rednewsbharat.live/api';
    // We use fetch to get memoization in Next.js Server Components
    let res = await fetch(`${backendUrl}/news/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      res = await fetch(`${backendUrl}/news/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    }
    
    if (!res.ok) return {};
    
    const data = await res.json();
    const article = data.news || data.data || data; // Accommodate standard API response wrappers
    
    if (!article || !article.title) return {};

    const articleUrl = `${baseUrl}/news/${article.slug || slug}`;
    const mainImgObj = (article.images && article.images.length > 0)
      ? (article.images.find(img => img.isMain) || article.images[0])
      : null;
    const rawImage = mainImgObj?.url || null;

    // WhatsApp crawler rejects images over 300KB. Next.js image optimization delivers high-quality ~100KB JPEG:
    let ogImage = `${baseUrl}/logo.webp`;
    if (rawImage) {
      const fullImgUrl = rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage}`;
      ogImage = `${baseUrl}/_next/image?url=${encodeURIComponent(fullImgUrl)}&w=1200&q=75`;
    }
        
    const rawExcerpt = article.summary || article.content || '';
    const cleanExcerpt = rawExcerpt.replace(/<[^>]*>?/gm, '').substring(0, 160);

    return {
      title: article.title,
      description: cleanExcerpt,
      alternates: {
        canonical: articleUrl,
      },
      openGraph: {
        title: article.title,
        description: cleanExcerpt,
        url: articleUrl,
        siteName: 'RED NEWS BHARAT',
        type: 'article',
        publishedTime: article.createdAt || article.publishedAt || new Date().toISOString(),
        modifiedTime: article.updatedAt || new Date().toISOString(),
        section: article.category?.name || article.category || 'राष्ट्रीय',
        images: [
          {
            url: ogImage,
            secureUrl: ogImage,
            width: 1200,
            height: 630,
            alt: article.title,
            type: 'image/jpeg',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: cleanExcerpt,
        images: [ogImage],
      }
    };
  } catch (error) {
    console.error("Error generating metadata for", slug, error);
    return {};
  }
}

export default async function NewsArticleLayout({ children, params }) {
  let article = null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rednewsbharat.live';
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rednewsbharat.live/api';
    let res = await fetch(`${backendUrl}/news/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      res = await fetch(`${backendUrl}/news/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    }
    if (res.ok) {
      const data = await res.json();
      article = data.news || data.data || data;
    }
  } catch (e) {
    // Ignore fetch error silently for the UI layout
  }

  // Normalize data for the Schema component
  const schemaArticle = (article && article.title) ? {
    title: article.title,
    slug: article.slug || params.slug,
    excerpt: article.summary || article.content,
    coverImage: (article.images && article.images.length > 0) ? article.images[0].url : null,
    publishedAt: article.createdAt || article.publishedAt || new Date().toISOString(),
    updatedAt: article.updatedAt || new Date().toISOString(),
    category: article.category?.name || article.category || 'News',
    authorName: article.author?.name || 'RED NEWS BHARAT Desk',
  } : null;

  return (
    <>
      {schemaArticle && <ArticleSchema article={schemaArticle} />}
      {children}
    </>
  );
}
