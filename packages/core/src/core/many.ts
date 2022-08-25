import { Filter, WhereFilter } from "../filter";
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

  if (filter.where) {
    return getItemsForWhereFilter(table, filter.where);
  }

  return [];
}

/**
 * Retrieves all items from the table matching a given filter.
 */
async function getItemsForWhereFilter<T, P extends keyof T>(
  table: SyncTable<T, P>,
  filter: WhereFilter<T>
) {
  if (Object.keys(filter).length === 0) {
    return [];
  }

  let items: T[] = [];

  // Retrieve items from table
  const primaryKeyProperty = table[SyncKey].options.primary;
  if (primaryKeyProperty in filter) {
    const primaryKey = String(filter[primaryKeyProperty]);
    const item = table[SyncKey].storage.primary.get(primaryKey);
    if (item) {
      items.push(item);
    }
  } else {
    items = table[SyncKey].storage.primary.valuesArray();
  }

  // Filter out items
  if (items.length > 0) {
    items = items.filter((item) => {
      for (const property in filter) {
        if (item[property] !== filter[property]) {
          return false;
        }
      }
      return true;
      1;
    });
  }

  return items;
}
