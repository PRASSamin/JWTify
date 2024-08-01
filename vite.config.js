import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { ViteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "generate-redirects",
      closeBundle() {
        fs.writeFileSync("dist/_redirects", "/* /index.html 200");
      },
    },
    ViteStaticCopy({
      targets: [
        {
          src: "./sitemap.xml",
          dest: "",
        },
      ],
    }),
    ViteStaticCopy({
      targets: [
        {
          src: "./BingSiteAuth.xml",
          dest: "",
        },
      ],
    }),
  ],
});
