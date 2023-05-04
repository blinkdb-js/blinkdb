import { middleware } from "../events/Middleware";
import { PrimaryKeyIndexable, PrimaryKeyProps } from "../query/types";
import { Table } from "./createTable";
import { internalUpdateMany } from "./updateMany";

/**
 * Saves updates of the given `entity` in `table`.
 *
 * @throws if the entity has not been inserted into the table before, e.g. if the primary key of the entity was not found.
 *
 * @returns the primary key of the updated entity.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Increase the age of Alice
 * await update(userTable, { id: userId, age: 16 });
 */
export async function update<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, diff: Diff<T, P>): Promise<T[P]> {
  return middleware<T, P, "update">(
    table,
    { action: "update", params: [table, diff] },
    (table, diff) => internalUpdate(table, diff)
  );
}

export async function internalUpdate<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, diff: Diff<T, P>): Promise<T[P]> {
  const ids = await internalUpdateMany(table, [diff]);
  return ids[0];
}

export type Diff<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
> = Partial<T> & {
  [Key in P]: T[P];
};
