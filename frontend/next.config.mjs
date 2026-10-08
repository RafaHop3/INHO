/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: '/api/proxy-baileys/:path*',
        destination: "${process.env.NEXT_PUBLIC_BAILEYS_URL || 'http://52.20.22.241:3001'}/:path*",
      },
    ];
  },
};
export default nextConfig;
