import { BASE_URL } from "@/constants";
import { tools } from "@/lib/tools/source";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const allTools = tools.getTools();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1,
    },
    ...allTools.map((tool) => ({
      url: `${BASE_URL}${tool.url}`,
      lastModified: tool.updatedAt,
      priority: 0.9,
    })),
  ];
}
