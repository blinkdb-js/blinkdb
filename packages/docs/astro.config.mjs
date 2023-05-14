import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import prefetch from '@astrojs/prefetch';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx(),
    prefetch({ selector: "a[href^='/docs']" })
  ],
  markdown: {
    shikiConfig: {
      theme: "poimandres",
    },
  },
});
