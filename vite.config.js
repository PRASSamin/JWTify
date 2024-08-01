import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

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
  ],
});
