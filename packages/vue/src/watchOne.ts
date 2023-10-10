import {
  Entity,
  ItemNotFoundError,
  key,
  MoreThanOneItemFoundError,
  PrimaryKeyOf,
  Query,
  Table,
} from "blinkdb";
import { computed, ToRefs } from "vue";
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
): ToRefs<QueryResult<T>>;

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
): ToRefs<QueryResult<T>>;

export function watchOne<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId: Query<T, P> | T[P]
): ToRefs<QueryResult<T>> {
  let result: ToRefs<QueryResult<T[]>>;

  if (queryOrId === undefined) {
    result = watchMany(table);
  } else {
    const query =
      typeof queryOrId === "object"
        ? queryOrId
        : ({ where: { [key(table)]: queryOrId } } as unknown as Query<T, P>);
    result = watchMany(table, query);
  }

  const error = computed(() => {
    if (result.state.value === "done") {
      if (result.data.value!.length === 0) {
        return new ItemNotFoundError(queryOrId);
      }
      if (result.data.value!.length > 1) {
        return new MoreThanOneItemFoundError(queryOrId);
      }
    }
  });

  return {
    error,
    state: computed(() => (error.value !== undefined ? "error" : result.state.value)),
    data: computed(() =>
      error.value === undefined && result.data.value ? result.data.value[0] : undefined
    ),
  } as ToRefs<QueryResult<T>>;
}
