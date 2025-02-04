/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true, 
  },
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  },
}

export default nextConfig;
