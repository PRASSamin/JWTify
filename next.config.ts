import type { NextConfig } from "next";
import { withFrontmatter } from "./plugins/frontmatter";
import { withToolsMapper } from "./plugins/mapper";

const withFM = withFrontmatter({
  dir: ["src/app/tool/**/page.{tsx,jsx,ts,js}", "src/app/tool/"],
  frequency: 10,
});
const withMapper = withToolsMapper();

const Config: NextConfig = withMapper(
  withFM({
    images: {
      remotePatterns: [{ protocol: "https", hostname: "**" }],
    },
  })
);

export default Config;
