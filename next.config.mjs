/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname for now as per current behavior
    }
  ]
  },
  allowedDevOrigins: ['*'],
};

export default nextConfig;
