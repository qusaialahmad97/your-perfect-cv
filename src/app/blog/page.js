// src/app/blog/page.js
import { client } from '@/lib/sanity'; // A small file to configure the Sanity client
import Link from 'next/link';

async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc)`;
  const posts = await client.fetch(query);
  return posts;
}

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post) => (
        <article key={post._id}>
          <Link href={`/blog/${post.slug.current}`}>
            <h2>{post.title}</h2>
          </Link>
        </article>
      ))}
    </div>
  );
}