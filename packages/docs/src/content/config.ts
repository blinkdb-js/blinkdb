import { defineCollection, z } from "astro:content";

export const collections = {
  reference: defineCollection({
    schema: z.object({
      title: z.string(),
      package: z.optional(z.enum(["blinkdb", "@blinkdb/react"])),
    }),
  }),
  docs: defineCollection({
    schema: z.object({
      title: z.string(),
    }),
  }),
};
