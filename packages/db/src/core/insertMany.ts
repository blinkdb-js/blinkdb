import BTree from "sorted-btree";
import { OrdProps } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { ValidEntity, Create } from "./insert";

/**
 * Inserts new entities into `table`.
 *
 * @returns the primary key of the inserted entities,
 * in the same order as the items.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const [aliceId, bobId, charlieId] = await insertMany(userTable, [
 *   { id: uuid(), name: "Alice", age: 23 },
 *   { id: uuid(), name: "Bob", age: 45 },
 *   { id: uuid(), name: "Charlie", age: 34 }
 * ]);
 */
export async function insertMany<T, P extends keyof T>(
  table: Table<T, P>,
  entities: ValidEntity<Create<T, P>>[]
): Promise<T[P][]> {
  const primaryKeys: T[P][] = [];
  const events: { entity: T }[] = [];
  for (const entity of entities) {
    const validEntity = entity as Create<T, P>;
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = validEntity[primaryKeyProperty] as T[P] & OrdProps;

    if (table[BlinkKey].storage.primary.has(primaryKey)) {
      throw new Error(`Primary key ${primaryKey} already in use.`);
    }

    const storageEntity = table[BlinkKey].db[BlinkKey].options.clone
      ? clone(validEntity)
      : validEntity;

    table[BlinkKey].storage.primary.set(primaryKey, storageEntity);
    for (const property in table[BlinkKey].storage.indexes) {
      const btree = table[BlinkKey].storage.indexes[property]!;
      const key = validEntity[property] as T[typeof property] & OrdProps;
      if (key === null || key === undefined) continue;

      const items = btree.get(key);
      if (items !== undefined) {
        items.push(storageEntity);
      } else {
        btree.set(key, [storageEntity]);
      }
    }
    primaryKeys.push(primaryKey);
    events.push({ entity: storageEntity });
  }
  table[BlinkKey].events.onInsert.dispatch(events);
  return primaryKeys;
}
