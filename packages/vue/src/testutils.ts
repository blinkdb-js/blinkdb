import { createApp } from "vue";

export interface User {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  name: string;
}

export function withSetup<T>(composable: () => T) {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      // suppress missing template warning
      return () => {};
    },
  });
  app.mount(document.createElement("div"));
  // return the result and the app instance
  // for testing provide / unmount
  return [result!, app] as const;
}
