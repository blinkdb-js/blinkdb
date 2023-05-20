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

export interface WrapperProps {
  db?: BlinkDbProviderProps<any>["db"];
  model?: BlinkDbProviderProps<any>["model"];
}

export const createWrapper = (db: BlinkDbProviderProps<any>["db"], model: BlinkDbProviderProps<any>["model"]) => {
  return (props: PropsWithChildren<WrapperProps>) => (
    <BlinkDbProvider db={props.db ?? db} model={props.model ?? model}>{props.children}</BlinkDbProvider>
  )
};

export const blinkDbWrapper = createWrapper(createDB(), model);