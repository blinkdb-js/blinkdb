import { Hook } from "../events/types";

export const BlinkKey = Symbol("BlinkDB");

/**
 * Creates a new database.
 *
 * Using the `db` object, you can create new tables in which to save your entities.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const taskTable = createTable<Task>(db, "tasks")();
 */
export function createDB(options?: Partial<DBOptions>): Database {
  return {
    [BlinkKey]: {
      options: {
        clone: true,
        ...options,
      },
      hooks: [],
    },
  };
}

export interface DBOptions {
  /**
   * Toggles whether entities are cloned before being written with `insert` or
   * returned from functions like `many()`, `first()` or `one()`.
   *
   * If enabled, adds a performance cost, but prevents the user from modifying
   * the returned entities directly, which would bring the database into an inconsistent state.
   *
   * @default true
   */
  clone: boolean;
}

export interface Database {
  [BlinkKey]: {
    options: Required<DBOptions>;
    hooks: Hook<any, any>[];
  };
}
