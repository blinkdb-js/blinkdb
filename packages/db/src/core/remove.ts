import BTree from "sorted-btree";
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
  const primaryKey = entity[primaryKeyProperty];
  const indexEntries = Object.entries<BTree<any, T[]>>(
    table[BlinkKey].storage.indexes as any
  );
  // For tables without indexes, it is not necessary to retrieve the actual entity before deleting it
  // For tables with indexes, we need the full entity to find all corresponding index entries
  const item =
    indexEntries.length > 0 ? table[BlinkKey].storage.primary.get(primaryKey) : undefined;
  const deleted = table[BlinkKey].storage.primary.delete(primaryKey);
  if (item !== undefined) {
    for (const [property, btree] of indexEntries) {
      const key = (item as any)[property];
      if (key == null) continue;

      const items = btree.get(key);
      if (items !== undefined) {
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
  }
  table[BlinkKey].events.onRemove.dispatch({ entity: entity as unknown as T });
  return deleted;
}

export type Ids<T, P extends keyof T> = Required<Pick<T, P>>;
