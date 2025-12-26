import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/login",
          "/workspace",
          "/runs",
          "/test-canvas",
          "/test-shotstack",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
