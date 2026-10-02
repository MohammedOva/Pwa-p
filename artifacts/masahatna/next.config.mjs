/** @type {import('next').NextConfig} */
const allowedDevOrigins = ['localhost', '127.0.0.1']

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedDevOrigins.push(process.env.REPLIT_DEV_DOMAIN)
}

const nextConfig = {
  allowedDevOrigins,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
