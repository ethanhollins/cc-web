/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
};

export default nextConfig;
