import { middleware } from "../events/Middleware";
import { Entity, isOrdinal, PrimaryKeyOf } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { Ids } from "./remove";

/**
 * Removes the given `entities` from the `table`.
 *
 * @returns true if all entities were found and removed, false otherwise.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Remove Alice from the table
 * await remove(userTable, { id: userId });
 */
export function removeMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entities: Ids<T, P>[]
): Promise<boolean> {
  return Promise.resolve(
    middleware<T, P, "removeMany">(
      table,
      { action: "removeMany", params: [table, entities] },
      (table, entities) => internalRemoveMany(table, entities)
    )
  );
}

export function internalRemoveMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entities: Ids<T, P>[]
): Promise<boolean> {
  const events: { entity: T }[] = [];
  let allEntitiesRemoved = true;
  for (const entity of entities) {
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = entity[primaryKeyProperty];

    const indexes = table[BlinkKey].storage.indexes;
    if (Object.keys(indexes).length > 0) {
      const item = table[BlinkKey].storage.primary.get(primaryKey);
      if (!item) return Promise.resolve(false);
      for (const property in indexes) {
        const btree = indexes[property]!;
        const key = item[property];
        if (!isOrdinal(key)) continue;

        const items = btree.get(key)!;
        const deleteIndex = items.indexOf(item);
        if (deleteIndex !== -1) {
          if (items.length === 1) {
            btree.delete(key);
          } else {
            items.splice(deleteIndex, 1);
          }
          btree.totalItemSize--;
        }
      }
    }
    events.push({ entity: entity as unknown as T });
    const hasDeleted = table[BlinkKey].storage.primary.delete(primaryKey);
    if (hasDeleted) {
      table[BlinkKey].storage.primary.totalItemSize--;
    }
    allEntitiesRemoved = allEntitiesRemoved && hasDeleted;
  }
  void table[BlinkKey].events.onRemove.dispatch(events);
  return Promise.resolve(allEntitiesRemoved);
}
