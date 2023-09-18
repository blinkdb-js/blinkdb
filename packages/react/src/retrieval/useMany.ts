import { Entity, PrimaryKeyOf, Query, Table, watch } from "blinkdb";
import { useEffect, useState } from "react";
import { QueryResult } from "./types";

/**
 * Retrieve all entities from `table`.
 *
 * @example
 * const { data: allUsers } = useMany(userTable);
 */
export function useMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>
): QueryResult<T[]>;

/**
 * Retrieve all entities from `table` that match the given `filter`.
 *
 * @example
 * // All users called 'Alice'
 * const { data: allUsersNamedAlice } = useMany(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * });
 * // All users aged 25 and up
 * const { data: allUsersOlderThan25 } = useMany(userTable, {
 *   where: {
 *     age: { gt: 25 }
 *   }
 * });
 */
export function useMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query: Query<T, P>
): QueryResult<T[]>;

export function useMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  query?: Query<T, P>
): QueryResult<T[]> {
  const [state, setState] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    async function run() {
      if (query) {
        return watch<T, P>(table, query, (items) => setState(items));
      } else {
        return watch<T, P>(table, (items) => setState(items));
      }
    }

    let dispose = () => {};
    // Running this immediately causes issues in tests,
    // because apparently React assumes we're mutating
    // state in the test if watch immediately
    // calls the callback
    setTimeout(async () => {
      dispose = await run();
    });
    return dispose;
  }, [table, query]);

  return {
    data: state,
    state: state === undefined ? "loading" : "done",
    error: undefined,
  } as QueryResult<T[]>;
}
