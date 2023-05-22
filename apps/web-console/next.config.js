/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.namora.ai",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
