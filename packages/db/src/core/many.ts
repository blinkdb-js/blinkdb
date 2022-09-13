import { filterItems } from "../query/filter";
import { limitItems } from "../query/limit";
import { selectItems } from "../query/select";
import { sortItems } from "../query/sort";
import { Filter } from "../query/types";
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
export async function many<T, P extends keyof T>(table: Table<T, P>): Promise<T[]>;

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
 *     age: { $gt: 25 }
 *   }
 * });
 */
export async function many<T, P extends keyof T>(
  table: Table<T, P>,
  filter?: Filter<T, P>
): Promise<T[]>;

export async function many<T, P extends keyof T>(
  table: Table<T, P>,
  filter?: Filter<T, P>
): Promise<T[]> {
  if (filter === undefined) {
    const allItems = table[BlinkKey].storage.primary.valuesArray();
    return table[BlinkKey].db[BlinkKey].options.clone ? clone(allItems) : allItems;
  }

  let items: T[] = [];

  if (filter.where) {
    // Select items from the db
    items = await selectItems(table, filter.where);

    // Filter items
    items = filterItems(table, items, filter.where);
  }

  if (filter.sort) {
    // Sort items
    items = sortItems(items, filter.sort);
  }

  if (filter.limit) {
    // Limit items
    items = limitItems(table, items, filter.limit);
  }

  return table[BlinkKey].db[BlinkKey].options.clone ? clone(items) : items;
}
