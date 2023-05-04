import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { EntityWithPk, Ordinal, PrimaryKeyProps } from "../types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the first user
 * const firstUser = await first(userTable);
 */
export async function first<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
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
export async function first<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
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
export async function first<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  id: T[P]
): Promise<T | null>;

export async function first<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  queryOrId?: Query<T, P> | T[P]
): Promise<T | null> {
  return middleware<T, P, "first">(
    table,
    { action: "first", params: [table, queryOrId] },
    (table, query) => internalFirst(table, query)
  );
}

export async function internalFirst<
  T extends EntityWithPk<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, queryOrId?: Query<T, P> | T[P]): Promise<T | null> {
  if (queryOrId === undefined) {
    const btree = table[BlinkKey].storage.primary;
    const minKey = btree.minKey();
    let entity = minKey ? btree.get(minKey) ?? null : null;
    entity = table[BlinkKey].db[BlinkKey].options.clone ? clone(entity) : entity;
    return entity;
  } else if (typeof queryOrId !== "object") {
    let entity = table[BlinkKey].storage.primary.get(queryOrId as T[P] & Ordinal) ?? null;
    entity = table[BlinkKey].db[BlinkKey].options.clone ? clone(entity) : entity;
    return entity;
  }

  const res = get(table, queryOrId as Query<T, P>);
  if (!res[0]) {
    return null;
  }
  return table[BlinkKey].db[BlinkKey].options.clone ? clone(res[0]) : res[0];
}
