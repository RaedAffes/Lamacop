/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // OneDrive on Windows can lock webpack cache files (EPERM rename),
      // which then leads to missing chunk/module errors like "./52.js".
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
