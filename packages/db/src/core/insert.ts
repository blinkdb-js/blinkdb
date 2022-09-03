import { clone } from "./clone";
import { SyncKey } from "./createDB";
import { SyncTable } from "./createTable";

/**
 * Inserts a new entity into `table`.
 *
 * @returns the primary key of the inserted entity.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 * const bobId = insert(userTable, { id: uuid(), name: "Bob", age: 45 });
 * const charlieId = insert(userTable, { id: uuid(), name: "Charlie", age: 34 });
 */
export async function insert<T, P extends keyof T>(
  table: SyncTable<T, P>,
  entity: Create<T, P>
): Promise<T[P]> {
  const primaryKeyProperty = table[SyncKey].options.primary;
  const primaryKey = entity[primaryKeyProperty] as unknown as T[P];

  if (table[SyncKey].storage.primary.has(primaryKey)) {
    throw new Error(`Primary key ${primaryKey} already in use.`);
  }

  const storageEntity = (table[SyncKey].db[SyncKey].options.clone ? clone(entity) : entity) as unknown as T;

  table[SyncKey].storage.primary.set(primaryKey, storageEntity);
  table[SyncKey].events.onInsert.dispatch({ entity: storageEntity });
  return primaryKey;
}

export type Create<T, P extends keyof T> = Omit<T, P> & Required<Pick<T, P>>;
