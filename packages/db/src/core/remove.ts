import { middleware } from "../events/Middleware";
import { EntityWithPk, PrimaryKeyProps } from "../types";
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
export async function remove<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  entity: Ids<T, P>
): Promise<boolean> {
  return middleware<T, P, "remove">(
    table,
    { action: "remove", params: [table, entity] },
    (table, entity) => internalRemove(table, entity)
  );
}

export async function internalRemove<
  T extends EntityWithPk<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, entity: Ids<T, P>): Promise<boolean> {
  return internalRemoveMany(table, [entity]);
}

export type Ids<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>> = {
  [K in P]: T[P];
};
