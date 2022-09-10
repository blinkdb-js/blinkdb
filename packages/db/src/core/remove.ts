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
  const deleted = table[BlinkKey].storage.primary.delete(primaryKey);
  for (const [property, btree] of Object.entries<BTree<any, T[]>>(
    table[BlinkKey].storage.indexes as any
  )) {
    const key = (entity as any)[property];
    if (key === null || key === undefined) continue;

    if (btree.has(key)) {
      let items = btree.get(key)!;
      items = items.filter((i) => i[primaryKeyProperty] !== primaryKey);
      if (items.length === 0) {
        btree.delete(key);
      } else {
        btree.set(key, items);
      }
    }
  }
  table[BlinkKey].events.onRemove.dispatch({ entity: entity as unknown as T });
  return deleted;
}

export type Ids<T, P extends keyof T> = Required<Pick<T, P>>;
