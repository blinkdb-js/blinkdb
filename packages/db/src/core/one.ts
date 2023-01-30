import { executeTableHooks } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 *
 * @throws if no item or more than one item matches the filter.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the user with id 10
 * const userWithId = await one(userTable, { where: { id: 10 } });
 */
export async function one<T extends object, P extends keyof T>(
  table: Table<T, P>,
  query: Query<T, P>
): Promise<T> {
  return executeTableHooks(table, { action: "one", params: [table, query] }, () =>
    internalOne(table, query)
  );
}

export async function internalOne<T extends object, P extends keyof T>(
  table: Table<T, P>,
  query: Query<T, P>
): Promise<T> {
  const res = get(table, query);
  if (res.length === 0) {
    throw new Error("No items found for the given query.");
  } else if (res.length > 1) {
    throw new Error("More than one item found for the given query.");
  }

  return table[BlinkKey].db[BlinkKey].options.clone ? clone(res[0]) : res[0];
}
