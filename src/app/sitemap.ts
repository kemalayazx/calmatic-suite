import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://calmatic.vercel.app";

  const routes = [
    "", "/basic", "/scientific", "/financial", "/mortgage", "/investment",
    "/us-payroll", "/payroll", "/taxes", "/accounting", "/statistics",
    "/math", "/probability", "/geometry", "/converter", "/units", "/colors",
    "/currency", "/dates", "/timezone", "/health", "/cooking", "/gpa",
    "/age", "/fuel", "/savings", "/auto-loan", "/credit-card", "/loans",
    "/percentage", "/tip", "/discount", "/electronics", "/disclaimer",
    "/password", "/rent-buy", "/electricity", "/speed", "/random", "/text",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
