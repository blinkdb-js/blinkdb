import { SyncKey } from "./createDB";
import { SyncTable } from "./table";

/**
 * Inserts a new entity into `table`.
 *
 * @returns the primary key of the inserted entity.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users")();
 * const aliceId = create(userTable, { id: uuid(), name: "Alice", age: 23 });
 * const bobId = create(userTable, { id: uuid(), name: "Bob", age: 45 });
 * const charlieId = create(userTable, { id: uuid(), name: "Charlie", age: 34 });
 */
export async function create<T, P extends keyof T>(table: SyncTable<T, P>, entity: T): Promise<string> {
  const primaryKeyProperty = table[SyncKey].options.primary;
  const primaryKey = String(entity[primaryKeyProperty]);

  if(table[SyncKey].storage.primary.has(primaryKey)) {
    throw new Error(`Primary key ${primaryKey} already in use.`);
  }

  table[SyncKey].storage.primary.set(primaryKey, entity as unknown as T);
  return primaryKey;
}

