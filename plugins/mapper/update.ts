import { existsSync, readFileSync } from "fs";
import {
  getRelativeImportPath,
  parseNextRoute,
  removeExt,
  writeDefault,
} from "./utils";
import { OUTPUT_DIR, TOOLS_MAP_PATH } from ".";
import path from "path";
import writeFile from "write-file-atomic";

export async function updateToolsMap(filePaths: string[]) {
  const items = [];
  const imports = [];

  for (const file of filePaths) {
    try {
      const metaPath = path.join(
        ...file.split(path.sep).slice(0, -1),
        "meta.ts"
      );
      if (!existsSync(metaPath)) {
        await writeDefault(file);
      }

      // check if file exports frontmatter
      const content = readFileSync(metaPath, "utf8");
      const frontmatterRegex =
        /export\s+(?:const|let|var)\s+frontmatter\s*=\s*({[\s\S]*?})\s*;/m;
      const match = frontmatterRegex.exec(content);
      const hasFrontmatter = match !== null;

      if (!hasFrontmatter) {
        continue;
      }

      const importPath = getRelativeImportPath(
        path.resolve(OUTPUT_DIR, TOOLS_MAP_PATH),
        path.resolve(metaPath)
      );

      const varName = importPath
        .split("/")
        .at(-2)
        ?.replace(/[^a-zA-Z0-9]/g, "_");

      imports.push(
        `import { frontmatter as ${varName}_fm } from "${removeExt(importPath)}"`
      );
      items.push(
        `{path:"${file}",meta:"${metaPath}",${/title\s*:\s*(?:"([^"]*)"|'([^']*)'|([^,\n}]*))/.test(match[1]) ? `` : `title:"${file.split(path.sep).at(-2)}",`}frontmatter:${varName}_fm,url:"${parseNextRoute(file)}",slug:"${file.split(path.sep).at(-2)}"}`
      );
    } catch (err) {
      console.warn(`[ToolsMapper] Failed to map frontmatter from ${file}`, err);
    }
  }

  const fileContent = `${imports.join("\n")}
export const tools = [${items.join(",")}];`;

  await writeFile(path.resolve(OUTPUT_DIR, TOOLS_MAP_PATH), fileContent);
  console.log(`[ToolsMapper] Updated tools map`);
}
