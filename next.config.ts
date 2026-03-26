import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["macrocosmos", "@grpc/grpc-js", "@bufbuild/protobuf"],
  async redirects() {
    return [
      {
        source: "/admin/whales",
        destination: "/admin/whale-tracker",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
