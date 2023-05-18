import React from 'react';
import { createDB, Database } from "blinkdb";
import { ValidModel } from "./types";
import { DbContext, ModelContext } from "./context";
import { PropsWithChildren } from "react";

export interface BlinkDbProviderProps<M extends ValidModel> {
  db?: Database | (() => Database);
  model: M;
}

/**
 * Provides access to the BlinkDB database instance & all model tables,
 * and allows `useDB` and `useTable` hooks in child components to retrieve
 * their respective objects.
 *
 * Should be used at the root of your app.
 *
 * @example
 * export const model = (db) => ({
 *   users: createTable<User>(db, "users")(),
 *   // Nested tables work too!
 *   posts: {
 *     posts: createTable<Post>(db, "posts")(),
 *     images: createTable<PostImages>(db, "postImages")()
 *   }
 * }) satisfies ValidModel;
 *
 * type Model = ModelOf<typeof model>;
 *
 * export const App = () => {
 *   return (
 *     <BlinkDbProvider db={createDB()} model={model}>
 *       ...
*      </BlinkDbProvider>
 *   )
 * }
 */
export const BlinkDbProvider = <M extends ValidModel>(props: PropsWithChildren<BlinkDbProviderProps<M>>) => {
  const db = typeof props.db === "function" ? props.db() : props.db ?? createDB();
  const model = typeof props.model === "function" ? props.model(db) : props.model;

  return (
    <DbContext.Provider value={db}>
      <ModelContext.Provider value={model}>
        {props.children}
      </ModelContext.Provider>
    </DbContext.Provider>
  );
}