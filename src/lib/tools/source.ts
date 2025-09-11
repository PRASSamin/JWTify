import { ZodTypeAny, z } from "zod";
import { config } from "root/tool.config";
import { tools as map } from "root/.tools";

type DataTypes =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "undefined"
  | "function"
  | "symbol"
  | "bigint";

class ToolsArray<T extends Record<string, any>> extends Array<T> {
  constructor(...items: T[]) {
    super(...items);
    Object.setPrototypeOf(this, ToolsArray.prototype);
  }

  sortBy<K extends keyof T>(
    field: K,
    order: "asc" | "desc" = "asc",
    typePriority?: DataTypes | DataTypes[]
  ): ToolsArray<T> {
    const getTypePriority = (val: unknown): number => {
      const valType = typeof val;
      if (!typePriority) return 999;
      if (Array.isArray(typePriority)) {
        const idx = typePriority.indexOf(valType);
        return idx === -1 ? 999 : idx;
      }
      return valType === typePriority ? 0 : 999;
    };

    const compare = (aVal: any, bVal: any): number => {
      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const isNumericString = (v: any): boolean =>
        typeof v === "string" && v.trim() !== "" && isFinite(Number(v));

      const aIsNumeric = typeof aVal === "number" || isNumericString(aVal);
      const bIsNumeric = typeof bVal === "number" || isNumericString(bVal);

      if (aIsNumeric && bIsNumeric) {
        return order === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      // Compare by type
      const typeA = typeof aVal;
      const typeB = typeof bVal;

      if (typeA === "string" && typeB === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeA === "boolean" && typeB === "boolean") {
        return order === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      // Fallback: string coercion
      const aStr = String(aVal);
      const bStr = String(bVal);
      return order === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    };

    return new ToolsArray(
      ...[...this].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        const aPriority = getTypePriority(aVal);
        const bPriority = getTypePriority(bVal);

        if (aPriority !== bPriority) return aPriority - bPriority;

        return compare(aVal, bVal);
      })
    );
  }
}

type ExtractSchema<TConfig extends { schema: ZodTypeAny }> =
  TConfig["schema"] extends ZodTypeAny
    ? z.infer<TConfig["schema"]> & Record<string, any>
    : never;

export class ToolSource<
  TConfig extends { schema: ZodTypeAny } & Record<string, any>,
> {
  private config: TConfig;

  constructor(config: TConfig) {
    this.config = config;
  }

  // /**
  //  * Dynamically spins up a ToolSource from a config file.
  //  *
  //  * @warning Typings get nuked, no schema inference or IntelliSense.
  //  * For proper DX, stick with static imports.
  //  */
  // static async init<T extends { schema: ZodTypeAny; dir: string } = any>(
  //   configPath = "tool.config.ts"
  // ): Promise<ToolSource<T>> {
  //   const mod = await import(configPath);
  //   return new ToolSource<T>(mod.config);
  // }

  /**
   * Get tool by title
   */
  getTool({
    title,
    slug,
  }: {
    title?: string;
    slug?: string;
  }): ExtractSchema<TConfig> | undefined {
    const all = this.getTools();
    return all.find(
      (tool) =>
        tool.title.toLowerCase() === title?.toLowerCase() ||
        tool.slug.toLowerCase() === slug?.toLowerCase()
    );
  }

  /**
   * Get all tools
   */
  public getTools(): ToolsArray<ExtractSchema<TConfig>> {
    const tools: ExtractSchema<TConfig>[] = [];

    Promise.all(
      map.map(async (tool) => {
        const { frontmatter } = tool;
        try {
          const parsed = this.config.schema.safeParse({
            // @ts-expect-error: no check
            title: frontmatter.title || tool?.title,
            // @ts-expect-error: maybe present in future
            url: frontmatter?.url || tool?.url,
            slug: tool?.slug,
            ...frontmatter,
          });

          if (parsed.success) {
            tools.push(parsed.data as ExtractSchema<TConfig>);
          }
        } catch (err) {
          console.error(err);
        }
      }) ?? []
    );
    return new ToolsArray(...tools);
  }
}

export const tools = new ToolSource(config);
