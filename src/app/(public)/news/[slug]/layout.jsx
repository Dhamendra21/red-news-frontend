import { ArticleSchema } from '@/components/seo/ArticleSchema';

export async function generateMetadata({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rednewsbharat.live';
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // We use fetch to get memoization in Next.js Server Components
    const res = await fetch(`${backendUrl}/news/slug/${params.slug}`, { next: { revalidate: 60 } });
    
    if (!res.ok) return {};
    
    const data = await res.json();
    const article = data.news || data.data || data; // Accommodate standard API response wrappers
    
    if (!article || !article.title) return {};

    const articleUrl = `${baseUrl}/news/${article.slug || params.slug}`;
    const ogImage = article.image 
        ? (article.image.startsWith('http') ? article.image : `${baseUrl}${article.image}`)
        : `${baseUrl}/images/og-default.jpg`;
        
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
        type: 'article',
        publishedTime: article.createdAt || article.publishedAt || new Date().toISOString(),
        modifiedTime: article.updatedAt || new Date().toISOString(),
        section: article.category?.name || article.category || 'राष्ट्रीय',
        images: [
          {
            url: ogImage,
            width: 1280,
            height: 720,
            alt: article.title,
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
    console.error("Error generating metadata for", params.slug, error);
    return {};
  }
}

export default async function NewsArticleLayout({ children, params }) {
  let article = null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rednewsbharat.live';
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${backendUrl}/news/slug/${params.slug}`, { next: { revalidate: 60 } });
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
    coverImage: article.image,
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
