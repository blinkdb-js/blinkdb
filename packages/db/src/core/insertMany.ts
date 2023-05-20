import { middleware } from "../events/Middleware";
import { Entity, isOrdinal, PrimaryKeyOf } from "../types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { PrimaryKeyAlreadyInUseError } from "./errors";

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
export async function insertMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entities: T[]
): Promise<T[P][]> {
  return middleware<T, P, "insertMany">(
    table,
    { action: "insertMany", params: [table, entities] },
    (table, entities) => internalInsertMany(table, entities)
  );
}

export async function internalInsertMany<
  T extends Entity<T>,
  P extends PrimaryKeyOf<T>
>(table: Table<T, P>, entities: T[]): Promise<T[P][]> {
  const primaryKeys: T[P][] = [];
  const events: { entity: T }[] = [];
  for (const entity of entities) {
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = entity[primaryKeyProperty];

    if (table[BlinkKey].storage.primary.has(primaryKey)) {
      throw new PrimaryKeyAlreadyInUseError(primaryKey);
    }

    const storageEntity = table[BlinkKey].db[BlinkKey].options.clone
      ? clone(entity)
      : entity;

    table[BlinkKey].storage.primary.set(primaryKey, storageEntity);
    table[BlinkKey].storage.primary.totalItemSize++;
    for (const property in table[BlinkKey].storage.indexes) {
      const btree = table[BlinkKey].storage.indexes[property]!;
      const key = entity[property];
      if (!isOrdinal(key)) continue;

      const items = btree.get(key);
      if (items !== undefined) {
        items.push(storageEntity);
      } else {
        btree.set(key, [storageEntity]);
      }
      btree.totalItemSize++;
    }
    primaryKeys.push(primaryKey);
    events.push({ entity: storageEntity });
  }
  void table[BlinkKey].events.onInsert.dispatch(events);
  return primaryKeys;
}
