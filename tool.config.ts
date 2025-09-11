import { Frontmatter } from "@/lib/tools/frontmatter";
import z from "zod";

export const config = {
  dir: "src/app/tool/",
  schema: Frontmatter.extend({
    description: z.string().optional(),
    updatedAt: z.string().optional(),
    priority: z.number().optional(),
  }),
};
