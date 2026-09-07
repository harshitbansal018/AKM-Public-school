/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hides the floating Next.js dev badge in the corner during `next dev`.
  // It never appears in a production build, so this is purely cosmetic.
  devIndicators: false,

  images: {
    remotePatterns: [
      // uploads served by the Express API in development — the port moves
      // around locally, so allow any of them rather than pinning one.
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
