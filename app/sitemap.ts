import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://taopulse.io";
  const pages = ["", "/what-is-tao", "/buy-tao", "/wallets", "/staking", "/subnets", "/subnets/directory", "/news", "/halving", "/portfolio", "/validator-calculator", "/join", "/emissions", "/dtao", "/glossary"];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/news" ? "daily" : "weekly",
    priority:
      path === "" ? 1.0
      : path === "/staking" || path === "/subnets" ? 0.9
      : path === "/halving" || path === "/portfolio" ? 0.85
      : path === "/subnets/directory" ? 0.8
      : path === "/join" ? 0.7
      : 0.75,
  }));
}
