import { middleware } from "../events/Middleware";
import { Entity, PrimaryKeyOf } from "../types";
import { Table } from "./createTable";
import { internalRemoveMany } from "./removeMany";

/**
 * Removes a given `entity` from the `table`.
 *
 * @returns true if the entity was found and removed, false otherwise.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Remove Alice from the table
 * await remove(userTable, { id: userId });
 */
export function remove<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entity: Ids<T, P>
): Promise<boolean> {
  return Promise.resolve(
    middleware<T, P, "remove">(
      table,
      { action: "remove", params: [table, entity] },
      (table, entity) => internalRemove(table, entity)
    )
  );
}

export function internalRemove<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entity: Ids<T, P>
): Promise<boolean> {
  return internalRemoveMany(table, [entity]);
}

/**
 * Only primary key properties of T
 */
export type Ids<T extends Entity<T>, P extends PrimaryKeyOf<T>> = {
  [K in P]: T[P];
};
