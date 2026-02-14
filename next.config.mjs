/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        pathname: '**',
      },
    ],
  },
}

export default nextConfig
