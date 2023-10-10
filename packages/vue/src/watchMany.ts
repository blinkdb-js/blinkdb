import { Entity, PrimaryKeyOf, Query, Table, watch } from "blinkdb";
import { computed, onBeforeMount, onBeforeUnmount, ref, ToRefs } from "vue";
import { QueryResult } from "./types";

/**
 * Retrieve all entities from `table`.
 *
 * @example
 * const queryResult = watchMany(userTable);
 */
export function watchMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): ToRefs<QueryResult<T[]>>;

/**
 * Retrieve all entities from `table` that match the given `filter`.
 *
 * @example
 * // All users called 'Alice'
 * const queryResult = watchMany(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 * // All users aged 25 and up
 * const queryResult = watchMany(userTable, {
 *   where: {
 *     age: { gt: 25 }
 *   }
 * });
 */
export function watchMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): ToRefs<QueryResult<T[]>>;

export function watchMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query?: Query<T, P>
): ToRefs<QueryResult<T[]>> {
  const result = ref<T[]>();
  let dispose: (() => void) | undefined = undefined;

  onBeforeMount(async () => {
    if (query) {
      dispose = await watch<T, P>(table, query, (items) => {
        result.value = items;
      });
    } else {
      dispose = await watch<T, P>(table, (items) => {
        result.value = items;
      });
    }
  });

  onBeforeUnmount(() => dispose?.());

  return {
    data: result,
    state: computed(() => (result.value === undefined ? "loading" : "done")),
    error: ref(undefined),
  } as ToRefs<QueryResult<T[]>>;
}
