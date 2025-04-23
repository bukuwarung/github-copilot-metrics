/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output a standalone build for easier deployment
  output: 'standalone',
  
  // Enable image optimization since we're on a persistent server
  images: {
    // You can enable optimization since you're on a persistent server
    unoptimized: false,
    // Set image domains if you're loading images from external sources
    // domains: ['example.com'],
  },
  
  // External packages (Next.js 15+ syntax)
  serverExternalPackages: ['@aws-sdk'],
  
  // Set the base path if you're not hosting at the root (optional)
  // basePath: '/dashboard',
  
  // Additional production settings
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
