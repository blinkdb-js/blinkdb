import { clone } from "./clone";
import { ThunderKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Inserts a new entity into `table`.
 *
 * @returns the primary key of the inserted entity.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = await insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 * const bobId = await insert(userTable, { id: uuid(), name: "Bob", age: 45 });
 * const charlieId = await insert(userTable, { id: uuid(), name: "Charlie", age: 34 });
 */
export async function insert<T, P extends keyof T>(
  table: Table<T, P>,
  entity: Create<T, P>
): Promise<T[P]> {
  const primaryKeyProperty = table[ThunderKey].options.primary;
  const primaryKey = entity[primaryKeyProperty] as unknown as T[P];

  if (table[ThunderKey].storage.primary.has(primaryKey)) {
    throw new Error(`Primary key ${primaryKey} already in use.`);
  }

  const storageEntity = (table[ThunderKey].db[ThunderKey].options.clone
    ? clone(entity)
    : entity) as unknown as T;

  table[ThunderKey].storage.primary.set(primaryKey, storageEntity);
  table[ThunderKey].events.onInsert.dispatch({ entity: storageEntity });
  return primaryKey;
}

export type Create<T, P extends keyof T> = Omit<T, P> & Required<Pick<T, P>>;
