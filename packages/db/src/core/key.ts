import { EntityWithPk, PrimaryKeyProps } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { Diff } from "./update";

/**
 * Returns the name of the property used as the primary key.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<{ uuid: string; }>(db, "users")({
 *   primary: "uuid"
 * });
 * const pk = key(userTable); // => "uuid"
 */
export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>
): P;

/**
 * Returns the primary key of an entity.
 *
 * @example
 * const pk = key(userTable, { id: "random-uuid", name: "Alice", age: 23 });
 */
export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  item: Diff<T, P>
): T[P];

/**
 * Returns the primary key of entities.
 *
 * @example
 * const [pk1, pk2] = key(userTable, [
 *   { id: "random-uuid-1", name: "Alice", age: 23 },
 *   { id: "random-uuid-2", name: "Bob", age: 49 }
 * ]);
 */
export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  item: Diff<T, P>[]
): T[P][];

/**
 * Returns the primary key of an entity.
 *
 * @example
 * await insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 * const pk = await key(userTable, first(userTable, {
 *   where: {
 *     name: "Alice"
 *   }
 * }));
 */
export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  item: Promise<Diff<T, P>>
): Promise<T[P]>;

/**
 * Returns the primary key of an entity.
 *
 * @example
 * await insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 * await insert(userTable, { id: uuid(), name: "Bob", age: 23 });
 * const pk = await key(userTable, many(userTable, {
 *   where: {
 *     age: 23
 *   }
 * }));
 */
export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  item: Promise<Diff<T, P>[]>
): Promise<T[P][]>;

export function key<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  item?: T | T[] | Promise<T> | Promise<T[]>
): P | T[P] | T[P][] | Promise<T[P] | T[P][]> {
  const primaryKeyProperty = table[BlinkKey].options.primary;
  if (item === undefined) {
    return primaryKeyProperty;
  } else if (isPromise(item)) {
    return item.then((item) => {
      if (Array.isArray(item)) {
        return item.map((item) => item[primaryKeyProperty]);
      } else {
        return item[primaryKeyProperty];
      }
    });
  } else if (Array.isArray(item)) {
    return item.map((item) => item[primaryKeyProperty]);
  } else {
    return item[primaryKeyProperty];
  }
}

function isPromise<T>(val: Promise<T> | T): val is Promise<T> {
  return "then" in val && typeof val.then === "function";
}
