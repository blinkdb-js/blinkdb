import { Filter } from "../filter";
import { SyncKey } from "./createDB";
import { SyncTable } from "./table";

/**
 * Retrieve all entities from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users")();
 * const allUsers = many(userTable);
 */
export async function many<T, P extends keyof T>(
  table: SyncTable<T, P>
): Promise<T[]>;

/**
 * Retrieve all entities from `table` that match the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users")();
 * // All users called 'Alice'
 * const allUsersNamedAlice = many(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 * // All users aged 25 and up
 * const allUsersOlderThan25 = many(userTable, {
 *   where: {
 *     age: gt(25)
 *   }
 * });
 */
export async function many<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: Filter<T>
): Promise<T[]>;

export async function many<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter?: Filter<T>
): Promise<T[]> {
  if (!filter) {
    return table[SyncKey].storage.primary.valuesArray();
  }

  let items: T[] = [];

  if (filter.where) {
    if (Object.keys(filter.where).length === 0) {
      return items;
    }

    const primaryKeyProperty = table[SyncKey].options.primary;
    if (primaryKeyProperty in filter.where) {
      const primaryKey = String(filter.where[primaryKeyProperty]);
      const item = table[SyncKey].storage.primary.get(primaryKey);
      if (item) {
        items.push(item);
      }
    } else {
      items = table[SyncKey].storage.primary.valuesArray();
    }

    if (items.length > 0) {
      items = items.filter(item => {
        for (const property in filter.where) {
          if (item[property] !== filter.where[property]) {
            return false;
          }
        }
        return true;
      });
    }
  }

  return items;
}
