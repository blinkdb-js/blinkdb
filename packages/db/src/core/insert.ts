import { executeTableHooks } from "../events/Middleware";
import { Table } from "./createTable";
import { internalInsertMany } from "./insertMany";

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
export async function insert<T extends object, P extends keyof T>(
  table: Table<T, P>,
  entity: Create<T, P>
): Promise<T[P]> {
  return executeTableHooks(table, { action: "insert", params: [table, entity] }, () =>
    internalInsert(table, entity)
  );
}

export async function internalInsert<T extends object, P extends keyof T>(
  table: Table<T, P>,
  entity: Create<T, P>
): Promise<T[P]> {
  const ids = await internalInsertMany(table, [entity]);
  return ids[0];
}

/**
 * T with non-optional primary keys.
 */
export type Create<T, P extends keyof T> = T & {
  [Key in P]-?: T[P];
};
