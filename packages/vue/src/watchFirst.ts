import { Entity, key, PrimaryKeyOf, Query, Table } from "blinkdb";
import { computed, ref, ToRefs } from "vue";
import { QueryResult } from "./types";
import { watchMany } from "./watchMany";

/**
 * Retrieves the first entity from `table`.
 *
 * @example
 * // Retrieve the first user
 * const { data: firstUser } = watchFirst(userTable);
 */
export function watchFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): ToRefs<QueryResult<T | null>>;

/**
 * Retrieves the first entity from `table` matching the given `filter`.
 *
 * @example
 * // Retrieve the first user named 'Alice'
 * const { data: firstUser } = watchFirst(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 */
export function watchFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): ToRefs<QueryResult<T | null>>;

/**
 * Retrieves the first entity from `table` with the given `id`.
 *
 * @example
 * // Retrieve the 'Alice' user by their id
 * const { data: firstUser } = watchFirst(userTable, 'alice-uuid');
 */
export function watchFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  id: T[P]
): ToRefs<QueryResult<T | null>>;

export function watchFirst<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  queryOrId?: Query<T, P> | T[P]
): ToRefs<QueryResult<T | null>> {
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

  return {
    state: result.state,
    data: computed(() => (result.data.value ? result.data.value[0] ?? null : undefined)),
    error: ref<undefined>(undefined),
  } as ToRefs<QueryResult<T | null>>;
}
