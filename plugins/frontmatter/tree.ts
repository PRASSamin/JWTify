import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import ts from "typescript";

export type DependencyTree = Record<string, string[]>;

export function buildDependencyTree(pages: string[]): DependencyTree {
  const tree: DependencyTree = {};

  for (const page of pages) {
    const seen = new Set<string>();
    const deps = crawlDeps(page, seen);
    deps.delete(page); // sanity
    tree[path.normalize(page)] = [...deps, path.normalize(page)];
  }

  return tree;
}

function crawlDeps(filePath: string, seen: Set<string>): Set<string> {
  const deps = new Set<string>();

  function walk(current: string) {
    if (seen.has(current)) return;
    seen.add(current);

    const imports = getImports(current);
    for (const imp of imports) {
      const resolved = resolveImport(current, imp);
      if (resolved && !seen.has(resolved)) {
        deps.add(resolved);
        walk(resolved); // recursion to deeper crawl
      }
    }
  }

  walk(filePath);
  return deps;
}

function getImports(filePath: string): string[] {
  if (!statSync(filePath).isFile()) {
    return [];
  }

  const code = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.ESNext,
    true
  );

  const imports: string[] = [];

  sourceFile.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      imports.push(node.moduleSpecifier.text);
    }
  });

  return imports;
}

function loadAliasMap(): Record<string, string> {
  const tsconfigPath = path.resolve("tsconfig.json");
  const json = JSON.parse(readFileSync(tsconfigPath, "utf8"));

  const baseUrl = path.resolve(json.compilerOptions.baseUrl || ".");
  const paths: Record<string, string[]> = json.compilerOptions.paths || {};

  const aliasMap: Record<string, string> = {};

  for (const [key, values] of Object.entries(paths)) {
    const alias = key.replace(/\*$/, "");
    const target = values[0].replace(/\*$/, "");
    aliasMap[alias] = path.resolve(baseUrl, target);
  }

  return aliasMap;
}

const aliasMap = loadAliasMap();

function resolveImport(baseFile: string, importPath: string): string | null {
  const baseDir = path.dirname(baseFile);

  // Relative imports
  if (importPath.startsWith(".")) {
    const fullPath = path.resolve(baseDir, importPath);
    return resolveWithExtensions(fullPath);
  }

  // Aliases (@/, ~/, etc.)
  for (const [alias, targetDir] of Object.entries(aliasMap)) {
    if (importPath.startsWith(alias)) {
      const subPath = importPath.slice(alias.length);
      const fullPath = path.join(targetDir, subPath);
      return resolveWithExtensions(fullPath);
    }
  }

  // Skip npm packages
  return null;
}

function resolveWithExtensions(basePath: string): string | null {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
    path.join(basePath, "index.jsx"),
  ];

  for (const file of candidates) {
    if (existsSync(file)) return path.normalize(file);
  }

  return null;
}
