import type { NextConfig } from "next";
import chokidar from "chokidar";
import path from "path";
import { glob } from "glob";
import { updateJSFrontmatter } from "./update";
import { buildDependencyTree } from "./tree";

export interface WithFrontmatterOptions {
  /**
   * Directories to watch
   */
  dir: string[];

  /**
   * Update frequency in seconds
   */
  frequency?: number;
}

const WATCH_FLAG = "_JWTIFY_UPDATED_AT";
const JS_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

/**
 * Frontmatter Auto-Updater Plugin for Next.js (Dev Only)
 *
 * This plugin watches specified directories for file changes and automatically updates the `frontmatter` metadata,
 * injecting a fresh `updatedAt` timestamp whenever a file or one of its deep dependencies is modified.
 *
 * Designed specifically for Fetchy to keep tool and blog metadata always up to date during development.
 *
 * @remarks
 * - This only runs in development mode (`next dev`).
 * - It's best practice to **restart the dev server** whenever you add new tools or pages so dependency tracking stays in sync.
 * - Works with both `.mdx`, `.md` (markdown) and `.ts`, `.tsx`, `.js`, `.jsx` (Next.js pages).
 */
export function withFrontmatter({ dir, frequency }: WithFrontmatterOptions) {
  const isDev = process.argv.includes("dev");
  const isBuild = process.argv.includes("build");

  if ((isDev || isBuild) && process.env[WATCH_FLAG] !== "1") {
    process.env[WATCH_FLAG] = "1";
    void startWatcher(dir, frequency);
  }

  return (nextConfig: NextConfig = {}): NextConfig => {
    return {
      ...nextConfig,
      pageExtensions: nextConfig.pageExtensions ?? ["js", "jsx", "ts", "tsx"],
    };
  };
}

async function startWatcher(dir: string[], frequency?: number) {
  const globPatterns = (await Promise.all(dir.map((d) => glob(d)))).flat();

  const tree = buildDependencyTree(globPatterns);

  const flatList = Object.values(tree).flat();
  const watchFiles = [...new Set([...flatList, ...globPatterns])];

  const watcher = chokidar.watch(watchFiles, {
    ignoreInitial: true,
    persistent: true,
  });

  console.log("[FrontMatter] Watching for file changes...");

  watcher.on("change", async (filePath) => {
    const ext = path.extname(filePath);

    if (JS_EXTENSIONS.includes(ext)) {
      await Promise.all(
        Object.entries(tree).map(async ([entryFile, deps]) => {
          if (deps.includes(filePath)) {
            const segments = entryFile.split(path.sep);
            const metaFile = path.join(...segments.slice(0, -1), "meta.ts");
            await updateJSFrontmatter(metaFile, { frequency });
          }
        })
      );
    }
  });
}
