import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { Entity, PrimaryKeyOf } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { TableUtils } from "./table.utils";

/**
 * Retrieve all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const allUsers = await many(userTable);
 */
export async function many<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): Promise<T[]>;

/**
 * Retrieve all entities from `table` that match the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // All users called 'Alice'
 * const allUsersNamedAlice = await many(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 * // All users aged 25 and up
 * const allUsersOlderThan25 = await many(userTable, {
 *   where: {
 *     age: { gt: 25 }
 *   }
 * });
 */
export async function many<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]>;

export async function many<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]> {
  return middleware<T, P, "many">(
    table,
    { action: "many", params: [table, query] },
    (table, query) => internalMany(table, query)
  );
}

export async function internalMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]> {
  if (query === undefined) {
    const allItems = table[BlinkKey].storage.primary.valuesArray();
    return TableUtils.cloneIfNecessary(table, allItems);
  }

  const items = get(table, query);

  return TableUtils.cloneIfNecessary(table, items);
}
