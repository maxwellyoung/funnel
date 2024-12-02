/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Allow importing JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: "json",
    });

    // Ignore PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.worker.min.js": false,
    };
    return config;
  },
};

export default nextConfig;
