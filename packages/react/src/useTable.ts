import { Table } from "blinkdb";
import { useContext } from "react";
import { ModelContext } from "./context";
import { ModelOf, ValidModel } from "./types";
import { useDB } from "./useDB";

/**
 * A hook which retrieves a table from the database.
 *
 * Expects that a parent component has been wrapped with BlinkDbProvider.
 *
 * @example
 * const model = (db) => ({
 *   users: createTable<User>(db, "users")(),
 *   nested: {
 *     table: createTable<Post>(db, "posts")()
 *   }
 * }) satisfies ValidModel;
 *
 * type Model = ModelOf<typeof model>;
 *
 * const Component = () => {
 *   const userTable = useTable((model: Model) => model.users);
 *   const postTable = useTable((model: Model) => model.nested.table);
 *   ...
 * }
 */
export const useTable = <M extends ValidModel, TB extends Table<any, any>>(
  table: (model: ModelOf<M>) => TB
): TB => {
  const db = useDB();
  const model = useContext(ModelContext);

  if (!model) {
    throw new Error(
      `useTable was used, but a model has not been provided. Wrap your app in BlinkDbProvider and try again.`
    );
  }

  const resolvedModel: ModelOf<ValidModel> =
    typeof model === "function" ? model(db) : model;

  return table(resolvedModel as ModelOf<M>);
};
