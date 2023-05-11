import { defineCollection, z } from "astro:content";

export const collections = {
  reference: defineCollection({
    schema: z.object({
      title: z.string(),
    }),
  }),
  docs: defineCollection({
    schema: z.object({
      title: z.string(),
    }),
  }),
};
