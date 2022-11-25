import { get } from "../query";
import { Filter } from "../query/types";
import { Table } from "./createTable";
import { Ids } from "./remove";
import { removeMany } from "./removeMany";

/**
 * Removes all entities that match the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Remove all users older than 15
 * await removeMany(userTable, {
 *   where: {
 *     age: { gt: 15 }
 *   }
 * });
 */
export async function removeWhere<T, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>
): Promise<void> {
  await removeMany(table, get(table, filter) as Ids<T, P>[]);
}
