import BTree from "sorted-btree";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Inserts a new entity into `table`.
 *
 * @returns the primary key of the inserted entity.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = await insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 * const bobId = await insert(userTable, { id: uuid(), name: "Bob", age: 45 });
 * const charlieId = await insert(userTable, { id: uuid(), name: "Charlie", age: 34 });
 */
export async function insert<T, P extends keyof T>(
  table: Table<T, P>,
  entity: ValidEntity<Create<T, P>>
): Promise<T[P]> {
  const validEntity = entity as Create<T, P>;
  const primaryKeyProperty = table[BlinkKey].options.primary;
  const primaryKey = validEntity[primaryKeyProperty];

  if (table[BlinkKey].storage.primary.has(primaryKey)) {
    throw new Error(`Primary key ${primaryKey} already in use.`);
  }

  const storageEntity = table[BlinkKey].db[BlinkKey].options.clone
    ? clone(validEntity)
    : validEntity;

  table[BlinkKey].storage.primary.set(primaryKey, storageEntity);
  for (const property in table[BlinkKey].storage.indexes) {
    const btree = table[BlinkKey].storage.indexes[property]!;
    const key = validEntity[property];
    if (key === null || key === undefined) continue;

    const items = btree.get(key);
    if (items !== undefined) {
      items.push(storageEntity);
    } else {
      btree.set(key, [storageEntity]);
    }
  }
  table[BlinkKey].events.onInsert.dispatch({ entity: storageEntity });
  return primaryKey;
}

/**
 * The interfaces of entities are only valid if no property is of type Function or Symbol.
 */
export type ValidEntity<T> = T extends Function | Symbol
  ? never
  : T extends Date
  ? T
  : T extends BigInt
  ? T
  : T extends object
  ? { [K in keyof T]: ValidEntity<T[K]> }
  : T;

export type Create<T, P extends keyof T> = T & {
  [Key in P]-?: T[P];
};
