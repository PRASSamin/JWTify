import path from "path";
import { COMPILED_CONFIG_PATH, CONFIG_FILE_PATH, OUTPUT_DIR } from ".";
import { build } from "esbuild";
import { existsSync } from "fs";

export async function compileToolConfig() {
  const input = path.resolve(process.cwd(), CONFIG_FILE_PATH);
  const outdir = path.resolve(process.cwd(), OUTPUT_DIR);

  if (!existsSync(input)) {
    console.error("[ToolsMapper] tool.config.ts not found.");
    return;
  }

  try {
    await build({
      entryPoints: [input],
      outfile: path.join(outdir, COMPILED_CONFIG_PATH),
      format: "esm",
      bundle: true,
      platform: "node",
      target: "esnext",
      logLevel: "silent",
      loader: {
        ".ts": "ts",
      },
    });
  } catch (err) {
    console.error(
      "[ToolsMapper] Failed to compile tool.config.ts with esbuild",
      err
    );
  }
}
