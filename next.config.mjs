/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- ADD THIS ENTIRE 'images' BLOCK ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**', // This allows all images from your Sanity project CDN
      },
    ],
  },
  // --- END OF BLOCK ---
};

export default nextConfig;