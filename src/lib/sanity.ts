import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// These are the details from your Sanity project.
// The Sanity CLI should have automatically added them to your .env.local file.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2023-05-03' // Use a recent API version

// This is the main client for fetching data in your components
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // `false` if you want to ensure fresh data
})

// Helper function for generating image URLs with optimal settings
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}