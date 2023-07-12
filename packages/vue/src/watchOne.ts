import {
  Entity,
  ItemNotFoundError,
  key,
  MoreThanOneItemFoundError,
  PrimaryKeyOf,
  Query,
  Table,
} from "blinkdb";
import { computed, ComputedRef } from "vue";
import { QueryResult } from "./types";
import { watchMany } from "./watchMany";

/**
 * Retrieves the entity from `table` matching the given `filter`.
 *
 * @throws if no item or more than one item matches the filter.
 *
 * @example
 * // Retrieve the only user named 'Alice'
 * const queryResult = watchOne(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 */
export function watchOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): ComputedRef<QueryResult<T>>;

/**
 * Retrieves an entity from `table` with the given `id`.
 *
 * @throws if no item matches the given id.
 *
 * @example
 * // Retrieve the 'Alice' user by their id
 * const queryResult = watchOne(userTable, 'alice-uuid');
 */
export function watchOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): ComputedRef<QueryResult<T>>;

export function watchOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId: Query<T, P> | T[P]
): ComputedRef<QueryResult<T>> {
  const primaryKeyProperty = key(table);
  let result: ComputedRef<QueryResult<T[]>>;
  if (queryOrId === undefined) {
    result = watchMany(table);
  } else {
    const query =
      typeof queryOrId === "object"
        ? queryOrId
        : ({ where: { [primaryKeyProperty]: queryOrId } } as unknown as Query<T, P>);
    result = watchMany(table, query);
  }

  return computed((): QueryResult<T> => {
    if (result.value.state === "done") {
      if (result.value.data.length === 0) {
        return {
          state: "error",
          data: undefined,
          error: new ItemNotFoundError(queryOrId),
        };
      } else if (result.value.data.length > 1) {
        return {
          state: "error",
          data: undefined,
          error: new MoreThanOneItemFoundError(queryOrId),
        };
      }
    }

    return {
      ...result.value,
      data: result.value.data ? result.value.data[0] : undefined,
    } as QueryResult<T>;
  });
}
