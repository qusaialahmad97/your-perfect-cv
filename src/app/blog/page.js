// src/app/blog/page.js

import { client, urlFor } from '@/lib/sanity'; // Import urlFor for images
import Link from 'next/link';
import Image from 'next/image';

// --- EDIT 1: Enhance the Sanity query to fetch more data ---
// We're now fetching the mainImage, author's name, and the first category's title.
async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "mainImage": mainImage,
    "authorName": author->name,
    "categoryTitle": categories[0]->title,
    publishedAt
  }`;
  const posts = await client.fetch(query);
  return posts;
}

// --- SEO Metadata for the main blog page ---
export const metadata = {
  title: 'Our Blog | Your Perfect CV',
  description: 'Articles, insights, and tips on CV writing, career advice, and navigating the job market.',
};


export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From the Blog
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Insights and advice to help you build the perfect CV and land your dream job.
          </p>
        </div>
        
        {/* --- EDIT 2: Create a modern, responsive card grid --- */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post._id} className="flex flex-col items-start justify-between rounded-2xl p-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20 transition-shadow shadow-sm hover:shadow-lg">
              <div className="w-full">
                {/* Post Image */}
                {post.mainImage && (
                  <div className="relative w-full mb-4">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <Image
                        src={urlFor(post.mainImage).width(400).height(250).url()}
                        alt={post.title || 'Blog post image'}
                        width={400}
                        height={250}
                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                    </Link>
                  </div>
                )}
                
                <div className="flex items-center gap-x-4 text-xs">
                  {/* Published Date */}
                  <time dateTime={post.publishedAt} className="text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  {/* Category */}
                  {post.categoryTitle && (
                    <span className="relative z-10 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-600">
                      {post.categoryTitle}
                    </span>
                  )}
                </div>
                
                {/* Post Title */}
                <div className="group relative">
                  <h2 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h2>
                </div>
              </div>
              
              {/* Author Information */}
              {post.authorName && (
                <div className="relative mt-8 flex items-center gap-x-4">
                  {/* You can add author images later if you want */}
                  {/* <img src="..." alt="" className="h-10 w-10 rounded-full bg-gray-100" /> */}
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      {post.authorName}
                    </p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}