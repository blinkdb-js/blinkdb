import { BlinkDbProvider, BlinkDbProviderProps, ModelOf } from "./context";
import React, { PropsWithChildren } from "react";
import { createDB, createTable, Database } from "blinkdb";

export interface User {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  name: string;
}

export const model = (db: Database) => ({
  user: createTable<User>(db, "users")(),
  nested: {
    posts: createTable<Post>(db, "posts")()
  }
});

export type Model = ModelOf<typeof model>;

export const createWrapper = (db: BlinkDbProviderProps<any>["db"], model: BlinkDbProviderProps<any>["model"]) => {
  return ({ children }: PropsWithChildren<{}>) => (
    <BlinkDbProvider db={db} model={model}>{children}</BlinkDbProvider>
  )
};

export const blinkDbWrapper = createWrapper(createDB(), model);