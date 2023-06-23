import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import prefetch from '@astrojs/prefetch';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx(),
    prefetch({ selector: "a[href^='/docs']" }),
    react()
  ],
  markdown: {
    shikiConfig: {
      theme: "poimandres",
    },
  },
});
