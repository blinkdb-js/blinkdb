import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { Entity, PrimaryKeyOf } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { TableUtils } from "./table.utils";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user
 * const firstUser = await first(userTable);
 */
export async function first<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): Promise<T | null>;

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user named 'Alice'
 * const firstUser = await first(userTable, { where: { name: "Alice" } });
 */
export async function first<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): Promise<T | null>;

/**
 * Retrieves the first entity from `table` with the given `id`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the 'Alice' user by their id
 * const firstUser = await first(userTable, 'alice-uuid');
 */
export async function first<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): Promise<T | null>;

export function first<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId?: Query<T, P> | T[P]
): Promise<T | null> {
  return Promise.resolve(
    middleware<T, P, "first">(
      table,
      { action: "first", params: [table, queryOrId] },
      (table, query) => internalFirst(table, query)
    )
  );
}

export function internalFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId?: Query<T, P> | T[P]
): Promise<T | null> {
  if (queryOrId === undefined) {
    const btree = table[BlinkKey].storage.primary;
    const minKey = btree.minKey();
    const entity = minKey ? btree.get(minKey) ?? null : null;
    return Promise.resolve(TableUtils.cloneIfNecessary(table, entity));
  } else if (typeof queryOrId !== "object") {
    const entity = table[BlinkKey].storage.primary.get(queryOrId) ?? null;
    return Promise.resolve(TableUtils.cloneIfNecessary(table, entity));
  }

  const res = get(table, queryOrId);
  if (!res[0]) {
    return Promise.resolve(null);
  }
  return Promise.resolve(TableUtils.cloneIfNecessary(table, res[0]));
}
