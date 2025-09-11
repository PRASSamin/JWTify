"use client";
import { tools } from "@/lib/tools/source";
import { ToolCard } from "./ToolCard";

export const ToolsSection = () => {
  const allTools = tools.getTools().sortBy("priority", "desc");

  return (
    <section className="py-20">
      <div className="lg:container w-[95%] md:w-[90%] mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Explore Our Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <ToolCard
              key={tool.slug}
              title={tool.title}
              description={tool.description}
              url={tool.url}
            />
          ))}
        </div>
      </div>
    </section>
  );
};