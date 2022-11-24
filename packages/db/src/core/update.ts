import { Table } from "./createTable";
import { updateMany } from "./updateMany";

/**
 * Saves updates of the given `entity` in `table`.
 *
 * @throws if the entity has not been inserted into the table before, e.g. if the primary key of the entity was not found.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Increase the age of Alice
 * await update(userTable, { id: userId, age: 16 });
 */
export async function update<T extends object, P extends keyof T>(
  table: Table<T, P>,
  diff: Diff<T, P>
): Promise<void> {
  await updateMany(table, [diff]);
}

export type Diff<T extends object, P extends keyof T> = Partial<T> & {
  [Key in P]-?: T[P];
};
