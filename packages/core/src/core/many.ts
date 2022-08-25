import BTree from "sorted-btree";
import {
  ComplexEqualsValueMatcher,
  EqualsValueMatcher,
  Filter,
  GenericValueMatchers,
  ValueMatchers,
  WhereFilter,
} from "../filter";
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
): Promise<T[]> {
  if (Object.keys(filter).length === 0) {
    return [];
  }

  let items: T[] = [];

  // Retrieve items from table
  const primaryKeyProperty = table[SyncKey].options.primary;
  if (primaryKeyProperty in filter) {
    const matcher = filter[primaryKeyProperty] as ValueMatchers<T[P]>;
    items = await getItemsForRetrievalForMatcher(table[SyncKey].storage.primary, matcher);
  } else {
    items = table[SyncKey].storage.primary.valuesArray();
  }

  // Filter out items
  if (items.length > 0) {
    items = items.filter((item) => {
      for (const property in filter) {
        if (!matchesItem(item[property], filter[property] as any)) {
          return false;
        }
      }
      return true;
    });
  }

  return items;
}

/**
 * Retrieve all items from the database that could possibly match `matcher`.
 */
async function getItemsForRetrievalForMatcher<T>(
  btree: BTree<string, T>,
  matcher: ValueMatchers<T[keyof T]>
): Promise<T[]> {
  if (typeof matcher === "object" && "$equals" in matcher) {
    const key = String(
      (matcher as ComplexEqualsValueMatcher<T[keyof T]>).$equals
    );
    const item = btree.get(key);
    return item ? [item] : [];
  } else {
    const key = String(matcher);
    const item = btree.get(key);
    return item ? [item] : [];
  }
}

/**
 * Returns true if `property` matches the given `matcher`.
 */
function matchesItem<T, P extends keyof T>(property: T[P],  matcher: ValueMatchers<T[P]>): boolean {
  if (typeof matcher === "object" && "$equals" in matcher) {
    return property === (matcher as ComplexEqualsValueMatcher<T[keyof T]>).$equals;
  } else {
    return property === matcher;
  }
}
