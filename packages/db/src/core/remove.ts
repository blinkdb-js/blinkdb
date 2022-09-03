import { SyncKey } from "./createDB";
import { SyncTable } from "./createTable";

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
  table: SyncTable<T, P>,
  entity: Ids<T, P>
): Promise<boolean> {
  const primaryKeyProperty = table[SyncKey].options.primary;
  const primaryKey = entity[primaryKeyProperty];
  const deleted = table[SyncKey].storage.primary.delete(primaryKey);
  table[SyncKey].events.onRemove.dispatch({ entity: entity as unknown as T });
  return deleted;
}

export type Ids<T, P extends keyof T> = Required<Pick<T, P>>;
