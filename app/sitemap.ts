import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://taopulse.io";
  const pages = ["", "/what-is-tao", "/buy-tao", "/wallets", "/staking", "/subnets", "/news"];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/news" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : path === "/staking" || path === "/subnets" ? 0.9 : 0.8,
  }));
}
