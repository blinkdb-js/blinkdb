import { SyncDB, SyncKey } from "./createDB";

/**
 * Creates a new table where entities can be inserted/updated/deleted/retrieved.
 * 
 * The default primary key of tables is `id`. If you'd like to change that, supply a
 * `index` property in `options`.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users");
 * const taskTable = table<Task>(db, "tasks", {
 *   index: "uuid"
 * });
 */
export function table<T>(db: SyncDB, tableName: string, options?: TableOptions<T>): SyncTable<T> {

  return {
    [SyncKey]: {
      db,
      tableName,
      options: {
        index: options?.index ?? ("id" as string),
      },
    },
  };
}

export interface TableOptions<T> {
  index?: string|string[];
}

export interface SyncTable<T> {
  [SyncKey]: {
    db: SyncDB;
    tableName: string;
    options: Required<TableOptions<T>>;
  };
}
