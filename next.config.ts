import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/products/nextbody-s30",
        destination: "/products/nexbody-x60",
        permanent: true,
      },
      {
        source: "/products/nextbody-s20",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
