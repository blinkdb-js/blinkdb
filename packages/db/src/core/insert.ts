import { middleware } from "../events/Middleware";
import { Entity, PrimaryKeyOf } from "../types";
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
export function insert<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entity: T
): Promise<T[P]> {
  return Promise.resolve(
    middleware<T, P, "insert">(
      table,
      { action: "insert", params: [table, entity] },
      (table, entity) => internalInsert(table, entity)
    )
  );
}

export function internalInsert<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  entity: T
): Promise<T[P]> {
  return internalInsertMany(table, [entity]).then((ids) => ids[0]);
}
