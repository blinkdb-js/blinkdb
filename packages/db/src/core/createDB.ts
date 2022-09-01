export const SyncKey = Symbol("Sync");

/**
 * Creates a new database.
 * 
 * Using the `db` object, you can create new tables in which to save your entities.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users");
 * const taskTable = table<Task>(db, "tasks");
 */
export function createDB(options?: Partial<DBOptions>): SyncDB {
  return {
    [SyncKey]: {
      options: {
        clone: true,
        ...options
      },
    },
  };
}

export interface DBOptions {
  /**
   * Toggles whether entities are cloned before being returned from functions like `many()`, `first()` or `one()`.
   * 
   * If enabled, adds a performance cost, but prevents the user from modifying
   * the returned entities directly, which would bring the database into an inconsistent state.
   * 
   * @default true
   */
  clone: boolean;
}

export interface SyncDB {
  [SyncKey]: {
    options: Required<DBOptions>;
  };
}
