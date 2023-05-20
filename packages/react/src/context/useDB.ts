import { Database } from "blinkdb";
import { useContext } from "react";
import { DbContext } from "./context";

/**
 * A hook which retrieves the global database instance.
 *
 * Expects that a parent component has been wrapped with BlinkDbProvider.
 *
 * @example
 * const Component = () => {
 *   const db = useDB();
 *   ...
 * }
 */
export const useDB = (): Database => {
  const db = useContext(DbContext);

  if (!db) {
    throw new Error(
      `useDB was used, but a database has not been provided. Wrap your app in BlinkDbProvider and try again.`
    );
  }

  return db;
};
