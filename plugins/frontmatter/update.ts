import fs from "fs/promises";
import * as fss from "fs";
import writeFileAtomic from "write-file-atomic";

type UpdateOptions = {
  /**
   * Update frequency in seconds
   */
  frequency?: number;
};

export async function updateJSFrontmatter(
  filePath: string,
  options: UpdateOptions = {}
) {
  const frequency = options.frequency ?? 0;
  const now = new Date();
  const nowISO = now.toISOString();

  // check is filePath exists
  if (!fss.existsSync(filePath)) {
    return;
  }

  const raw = await fs.readFile(filePath, "utf8");
  const frontmatterRegex =
    /export\s+(?:const|let|var)\s+frontmatter\s*=\s*({[\s\S]*?})\s*;/m;

  const match = raw.match(frontmatterRegex);
  let updatedCode = "";

  if (match) {
    const original = match[1];

    // Check for existing updatedAt value
    const updatedAtMatch = original.match(/updatedAt\s*:\s*["'`](.*?)["'`]/);

    if (updatedAtMatch?.[1]) {
      const prevDate = new Date(updatedAtMatch[1]);

      const diffSeconds = (now.getTime() - prevDate.getTime()) / 1000;

      if (diffSeconds < frequency) {
        return;
      }
    }

    // Update or insert updatedAt
    let updatedObjectCode = original;

    if (updatedAtMatch) {
      updatedObjectCode = original.replace(
        /updatedAt\s*:\s*["'`].*?["'`]/,
        `updatedAt: "${nowISO}"`
      );
    } else {
      const endsWithComma = /,\s*}$/.test(original);
      updatedObjectCode = original.replace(
        /}$/,
        `${endsWithComma ? "" : ","}  updatedAt: "${nowISO}"\n}`
      );
    }

    const fullExport = `export const frontmatter = ${updatedObjectCode};`;
    updatedCode = raw.replace(frontmatterRegex, fullExport);
  } else {
    // Frontmatter block doesn't exist yet
    const lines = raw.split("\n");
    const nowExport = `export const frontmatter = {\n  updatedAt: "${nowISO}"\n};`;

    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i])) {
        lastImportIndex = i;
      }
    }

    updatedCode = [
      ...lines.slice(0, lastImportIndex + 1),
      "",
      nowExport,
      "",
      ...lines.slice(lastImportIndex + 1),
    ].join("\n");
  }

  try {
    await writeFileAtomic(filePath, updatedCode);
  } catch (err) {
    console.error(`[FrontMatter] Writing file error: ${filePath}:`, err);
  }
}
