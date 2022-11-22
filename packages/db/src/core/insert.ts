import { Table } from "./createTable";
import { insertMany } from "./insertMany";

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
  entity: ValidEntity<Create<T, P>>
): Promise<T[P]> {
  const ids = await insertMany(table, [entity]);
  return ids[0];
}

/**
 * The interfaces of entities are only valid if no property is of type Function or Symbol.
 */
export type ValidEntity<T> = T extends Function | Symbol
  ? never
  : T extends Date
  ? T
  : T extends BigInt
  ? T
  : T extends object
  ? { [K in keyof T]: ValidEntity<T[K]> }
  : T;

export type Create<T, P extends keyof T> = T & {
  [Key in P]-?: T[P];
};
