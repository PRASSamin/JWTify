import { z, ZodRawShape } from "zod";

export class Frontmatter {
  /**
   * Base schema for all frontmatter (internal use)
   */
  private static baseSchema = z.object({
    title: z.string(),
    url: z.string(),
    slug: z.string(),
  });

  /**
   * Extend base frontmatter schema with additional custom fields
   */
  static extend<T extends ZodRawShape>(shape: T) {
    return this.baseSchema.extend(shape);
  }
}
