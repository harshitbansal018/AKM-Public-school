/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // uploads served by the Express API in development
      { protocol: 'http', hostname: 'localhost', port: '5000' },
    ],
  },
};

export default nextConfig;
