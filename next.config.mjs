/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Obligatorio para Cloudflare
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true, // Necesario para exportación estática
  },
  env: {
    // Para variables públicas (se exponen en el cliente)
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    
    // Para variables privadas (si usas Cloudflare Workers/Pages Functions)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  },
  // Opcional: Configuración de redirecciones/reescrituras si necesitas
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
}

export default nextConfig