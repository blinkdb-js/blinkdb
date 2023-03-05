import { middleware } from "../events/Middleware";
import { OrdProps } from "../query/types";
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
export async function removeMany<T extends object, P extends keyof T>(
  table: Table<T, P>,
  entities: Ids<T, P>[]
): Promise<boolean> {
  return middleware<T, P, "removeMany">(
    table,
    { action: "removeMany", params: [table, entities] },
    (table, entities) => internalRemoveMany(table, entities)
  );
}

export async function internalRemoveMany<T extends object, P extends keyof T>(
  table: Table<T, P>,
  entities: Ids<T, P>[]
): Promise<boolean> {
  const events: { entity: T }[] = [];
  let allEntitiesRemoved = true;
  for (const entity of entities) {
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = entity[primaryKeyProperty] as T[P] & OrdProps;

    const indexes = table[BlinkKey].storage.indexes;
    if (Object.keys(indexes).length > 0) {
      const item = table[BlinkKey].storage.primary.get(primaryKey);
      if (!item) return false;
      for (const property in indexes) {
        const btree = indexes[property]!;
        const key = item[property] as T[typeof property] & OrdProps;
        if (key === null || key === undefined) continue;

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
  table[BlinkKey].events.onRemove.dispatch(events);
  return allEntitiesRemoved;
}
