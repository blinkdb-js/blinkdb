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
export function createDB(options?: DBOptions): SyncDB {
  return {
    [SyncKey]: {
      options: options ?? {},
    },
  };
}

export interface DBOptions {}

export interface SyncDB {
  [SyncKey]: {
    options: Required<DBOptions>;
  };
}
