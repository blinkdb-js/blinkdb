import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Retrieve all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const allUsers = await many(userTable);
 */
export async function many<T extends object, P extends keyof T>(
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
export async function many<T extends object, P extends keyof T>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]>;

export async function many<T extends object, P extends keyof T>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]> {
  return middleware(table, { action: "many", params: [table, query] }, () =>
    internalMany(table, query)
  );
}

export async function internalMany<T extends object, P extends keyof T>(
  table: Table<T, P>,
  query?: Query<T, P>
): Promise<T[]> {
  if (query === undefined) {
    const allItems = table[BlinkKey].storage.primary.valuesArray();
    return table[BlinkKey].db[BlinkKey].options.clone ? clone(allItems) : allItems;
  }

  const items = get(table, query);

  return table[BlinkKey].db[BlinkKey].options.clone ? clone(items) : items;
}
