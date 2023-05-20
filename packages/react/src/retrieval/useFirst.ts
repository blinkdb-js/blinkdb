import { Entity, key, PrimaryKeyOf, Query, Table } from "blinkdb";
import { QueryResult } from "./types";
import { useMany } from "./useMany";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * // Retrieve the first user
 * const { data: firstUser } = await useFirst(userTable);
 */
export function useFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): QueryResult<T | null>;

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 *
 * @example
 * // Retrieve the first user named 'Alice'
 * const { data: firstUser } = await useFirst(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 */
export function useFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): QueryResult<T | null>;

/**
 * Retrieves the first entity from `table` with the given `id`.
 *
 * @example
 * // Retrieve the 'Alice' user by their id
 * const { data: firstUser } = await useFirst(userTable, 'alice-uuid');
 */
export function useFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): QueryResult<T | null>;

export function useFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId?: Query<T, P> | T[P]
): QueryResult<T | null> {
  const primaryKeyProperty = key(table);
  let result: QueryResult<T[]>;
  if(queryOrId === undefined) {
    result = useMany(table);
  } else {
    const query = typeof queryOrId === "object" ? queryOrId : { where: { [primaryKeyProperty]: queryOrId } } as unknown as Query<T, P>;
    result = useMany(table, query);
  }

  return {
    ...result,
    data: result.data ? (result.data[0] ?? null) : undefined,
    error: undefined
  } as QueryResult<T | null>;
}