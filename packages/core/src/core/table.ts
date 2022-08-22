import { SyncDB, SyncKey } from "./createDB";

/**
 * Creates a new table where entities can be inserted/updated/deleted/retrieved.
 * 
 * The default primary key of a table is `id`. If you'd like to change that, supply a
 * `primary` property in `options` (either a string, or an array of strings for composite
 * primary keys).
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users");
 * const taskTable = table<Task>(db, "tasks", {
 *   primary: "uuid"
 * });
 */
export function table<T>(db: SyncDB, tableName: string, options?: TableOptions): SyncTable<T> {

  return {
    [SyncKey]: {
      db,
      tableName,
      options: {
        primary: options?.primary ?? ("id" as string),
      },
    },
  };
}

export interface TableOptions {
  primary?: string|string[];
}

export interface SyncTable<T> {
  [SyncKey]: {
    db: SyncDB;
    tableName: string;
    options: Required<TableOptions>;
  };
}
