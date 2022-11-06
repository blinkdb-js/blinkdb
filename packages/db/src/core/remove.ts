import BTree from "sorted-btree";
import { OrdProps } from "../query/types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Removes a given `entity` from the `table`.
 *
 * @returns true if the entity was found and removed, false otherwise.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Remove Alice from the table
 * await remove(userTable, { id: userId });
 */
export async function remove<T, P extends keyof T>(
  table: Table<T, P>,
  entity: Ids<T, P>
): Promise<boolean> {
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
      }
    }
  }

  table[BlinkKey].events.onRemove.dispatch({ entity: entity as unknown as T });
  return table[BlinkKey].storage.primary.delete(primaryKey);
}

export type Ids<T, P extends keyof T> = { [K in P]-?: T[P] };
