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
  entity: Create<T, P>
): Promise<T[P]> {
  const primaryKeyProperty = table[BlinkKey].options.primary;
  const primaryKey = entity[primaryKeyProperty] as unknown as T[P];

  if (table[BlinkKey].storage.primary.has(primaryKey)) {
    throw new Error(`Primary key ${primaryKey} already in use.`);
  }

  const storageEntity = (table[BlinkKey].db[BlinkKey].options.clone
    ? clone(entity)
    : entity) as unknown as T;

  table[BlinkKey].storage.primary.set(primaryKey, storageEntity);
  for (const [property, btree] of Object.entries<BTree<any, T[]>>(
    table[BlinkKey].storage.indexes
  )) {
    const key = (entity as any)[property];
    if (key === null || key === undefined) continue;

    if (btree.has(key)) {
      const items = btree.get(key)!;
      btree.set(key, [...items, storageEntity]);
    } else {
      btree.set(key, [storageEntity]);
    }
  }
  table[BlinkKey].events.onInsert.dispatch({ entity: storageEntity });
  return primaryKey;
}

export type Create<T, P extends keyof T> = Omit<T, P> & Required<Pick<T, P>>;
