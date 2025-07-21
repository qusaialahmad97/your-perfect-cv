// src/app/blog/[slug]/page.js

import { client, urlFor } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

const postQuery = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  mainImage,
  publishedAt,
  body,
  metaTitle,
  metaDescription,
  openGraphImage,
  "authorName": author->name,
}`;

async function getPost(slug) {
  const post = await client.fetch(postQuery, { slug });
  return post;
}

export async function generateMetadata({ params }) {
  // --- FIX 1: Await the params object before accessing its properties ---
  const awaitedParams = await params;
  const post = await getPost(awaitedParams.slug);

  if (!post) { return { title: 'Post Not Found' }; }

  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || '';
  const ogImageUrl = post.openGraphImage 
    ? urlFor(post.openGraphImage).width(1200).height(630).fit('crop').url()
    : (post.mainImage ? urlFor(post.mainImage).width(1200).height(630).fit('crop').url() : null);

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `/blog/${post.slug}`,
      siteName: 'Your Perfect CV',
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.authorName ? [post.authorName] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

const ptComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) { return null }
      return (
        <Image
          alt={value.alt || 'Blog post image'}
          loading="lazy"
          src={urlFor(value).width(800).fit('max').auto('format').url()}
          width={800}
          height={600}
          className="my-6 rounded-lg"
        />
      )
    }
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-extrabold my-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>,
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 my-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 my-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-2">{children}</li>,
    number: ({ children }) => <li className="mb-2">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-blue-600 hover:underline">
          {children}
        </a>
      )
    },
  },
}

export default async function BlogPost({ params }) {
  // --- FIX 2: Await the params object here as well ---
  const awaitedParams = await params;
  const post = await getPost(awaitedParams.slug);

  if (!post) {
    return <div>Post not found.</div>;
  }

  const jsonLd = { /* ... your existing jsonLd code ... */ };

  return (
    <article className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-6">Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
      
      {post.mainImage && (
        <div className="mb-8">
          <Image 
            src={urlFor(post.mainImage).width(800).url()} 
            alt={post.title} 
            width={800} 
            height={450} 
            className="rounded-lg" 
            priority
          />
        </div>
      )}
      
      <div className="text-lg leading-relaxed">
        <PortableText value={post.body} components={ptComponents} />
      </div>
    </article>
  );
}