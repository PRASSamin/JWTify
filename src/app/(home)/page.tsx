import { LandingHero } from "@/app/(home)/components/LandingHero";
import { ToolsSection } from "@/app/(home)/components/ToolsSection";
import { metatag } from "@/lib/metadata";
import { metadata } from "../layout";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-65px-77px)]">
      <LandingHero />
      <div id="tools">
        <ToolsSection />
      </div>
    </div>
  );
}

export const generateMetadata = async () => {
  return await metatag({
    title: metadata.title as string,
    description: metadata.description as string,
  });
};
