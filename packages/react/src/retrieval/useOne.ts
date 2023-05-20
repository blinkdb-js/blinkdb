import { Entity, ItemNotFoundError, key, MoreThanOneItemFoundError, PrimaryKeyOf, Query, Table } from "blinkdb";
import { QueryResult } from "./types";
import { useMany } from "./useMany";

/**
 * Retrieves the entity from `table` matching the given `filter`.
 *
 * @throws if no item or more than one item matches the filter.
 *
 * @example
 * // Retrieve the only user named 'Alice'
 * const { data: aliceUser } = await useOne(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 */
export function useOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): QueryResult<T>;

/**
 * Retrieves an entity from `table` with the given `id`.
 *
 * @throws if no item matches the given id.
 *
 * @example
 * // Retrieve the 'Alice' user by their id
 * const { data: aliceUser } = await useOne(userTable, 'alice-uuid');
 */
export function useOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): QueryResult<T>;

export function useOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId: Query<T, P> | T[P]
): QueryResult<T> {
  const primaryKeyProperty = key(table);
  let result: QueryResult<T[]>;
  if(queryOrId === undefined) {
    result = useMany(table);
  } else {
    const query = typeof queryOrId === "object" ? queryOrId : { where: { [primaryKeyProperty]: queryOrId } } as unknown as Query<T, P>;
    result = useMany(table, query);
  }

  if(result.state === "done") {
    if (result.data.length === 0) {
      return {
        state: "error",
        data: undefined,
        error: new ItemNotFoundError(queryOrId)
      }
    } else if (result.data.length > 1) {
      return {
        state: "error",
        data: undefined,
        error: new MoreThanOneItemFoundError(queryOrId)
      }
    }
  }

  return {
    ...result,
    data: result.data ? result.data[0] : undefined
  } as QueryResult<T>;
}