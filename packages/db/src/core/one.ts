import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Query } from "../query/types";
import { Entity, PrimaryKeyOf } from "../types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { ItemNotFoundError, MoreThanOneItemFoundError } from "./errors";

/**
 * Retrieves the first entity from `table` matching the given `id`.
 *
 * @throws if no item matches the given id.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Retrieve the user with id 10
 * const userWithId = await one(userTable, 10);
 */
export async function one<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): Promise<T>;

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
export async function one<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): Promise<T>;

export async function one<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId: Query<T, P> | T[P]
): Promise<T> {
  return middleware<T, P, "one">(
    table,
    { action: "one", params: [table, queryOrId] },
    (table, query) => internalOne(table, query)
  );
}

export async function internalOne<
  T extends Entity<T>,
  P extends PrimaryKeyOf<T>
>(table: Table<T, P>, queryOrId: Query<T, P> | T[P]): Promise<T> {
  if (typeof queryOrId !== "object") {
    let entity = table[BlinkKey].storage.primary.get(queryOrId) ?? null;
    if (entity === null) {
      throw new ItemNotFoundError(queryOrId);
    }
    entity = table[BlinkKey].db[BlinkKey].options.clone ? clone(entity) : entity;
    return entity;
  }

  const res = get(table, queryOrId);
  if (res.length === 0) {
    throw new ItemNotFoundError(queryOrId);
  } else if (res.length > 1) {
    throw new MoreThanOneItemFoundError(queryOrId);
  }

  return table[BlinkKey].db[BlinkKey].options.clone ? clone(res[0]) : res[0];
}
