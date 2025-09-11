import path from "path";
import { ROOT_FILE } from ".";
import prettier from "prettier";
import writeFile from "write-file-atomic";

/**
 * Get relative import path
 */
export function getRelativeImportPath(
  fromFile: string,
  toFile: string
): string {
  let relative = path.relative(path.dirname(fromFile), toFile);

  if (!relative.startsWith(".")) {
    relative = "./" + relative;
  }

  return relative.replace(/\\/g, "/"); // for Windows support
}

/**
 * Parse a Next.js route from a file path
 */
export const parseNextRoute = (filePath: string, baseDir = "src/app") => {
  const relative = path.relative(baseDir, filePath);
  const parts = relative.split(path.sep);

  const cleaned = parts
    .filter((part) => !part.startsWith("("))
    .filter((part) => !/^page\.(tsx|jsx|js|ts)$/.test(part))
    .map((part) => {
      // handle dynamic routes
      if (/^\[\.\.\.(.+)\]$/.test(part)) return `:${part.slice(4, -1)}*`; // [...slug] -> :slug*
      if (/^\[\[(.+)\]\]$/.test(part)) return `:${part.slice(2, -2)}?`; // [[slug]] -> :slug?
      if (/^\[(.+)\]$/.test(part)) return `:${part.slice(1, -1)}`; // [slug] -> :slug
      return part;
    });

  return "/" + cleaned.join("/");
};

/**
 * Expand braces in a pattern
 */
export const expandBraces = (pattern: string): Array<string> => {
  const braceRegex = /\{([^{}]+)\}/;

  if (!braceRegex.test(pattern)) return [pattern];

  const match = pattern.match(braceRegex);
  if (!match) return [pattern];

  const [whole, content] = match;
  const parts = content.split(",");

  const results = [];

  for (const part of parts) {
    const replaced = pattern.replace(whole, part);
    results.push(...expandBraces(replaced));
  }

  return results;
};

/**
 * Write default frontmatter to a file
 */
export const writeDefault = async (filePath: string) => {
  if (expandBraces(ROOT_FILE).some((ending) => filePath.endsWith(ending))) {
    const injectDefaultFrontmatter = await prettier.format(
      `export const frontmatter = {
updatedAt: "${new Date().toISOString()}",
};`,
      {
        parser: "typescript",
      }
    );
    await writeFile(
      path.join(...filePath.split(path.sep).slice(0, -1), "meta.ts"),
      injectDefaultFrontmatter
    );
  }
};

export const removeExt = (filePath: string) => {
  return filePath.replace(/\.[^/.]+$/, "");
};
