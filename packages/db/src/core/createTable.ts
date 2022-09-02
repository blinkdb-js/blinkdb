import BTree from "sorted-btree";
import { SyncDB, SyncKey } from "./createDB";

/**
 * Creates a new table where entities can be inserted/updated/deleted/retrieved.
 *
 * The default primary key of a table is `id`. If your interface does not have
 * a `id` property or you'd like to change it to something else, use this snippet:
 *
 * ```
 * interface User {
 *   uuid: string;
 *   name: string;
 * }
 *
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")({
 *   primary: "uuid" // whatever you want your primary key to be
 * });
 * ```
 *
 * Other options can be supplied with the `options` parameter.
 *
 * @example
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 */
export function createTable<T extends { id: string | number }>(
  db: SyncDB,
  tableName: string
): <P extends keyof T = "id">(options?: TableOptions<P>) => SyncTable<T, P>;

/**
 * Creates a new table where entities can be inserted/updated/deleted/retrieved.
 *
 * The default primary key of a table is `id`. If your interface does not have
 * a `id` property or you'd like to change it to something else, use this snippet:
 *
 * ```
 * interface User {
 *   uuid: string;
 *   name: string;
 * }
 *
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")({
 *   primary: "uuid" // whatever you want your primary key to be
 * });
 * ```
 *
 * Other options can be supplied with the `options` parameter.
 *
 * @example
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 */
export function createTable<T>(
  db: SyncDB,
  tableName: string
): <P extends keyof T>(options: TableOptions<P>) => SyncTable<T, P>;

export function createTable<T>(db: SyncDB, tableName: string) {
  return <P extends keyof T>(options: TableOptions<P>): SyncTable<T, P | "id"> => {
    return {
      [SyncKey]: {
        db,
        tableName,
        storage: {
          primary: new BTree(),
        },
        options: {
          primary: options?.primary ?? "id",
        },
      },
    };
  };
}

export interface TableOptions<P> {
  primary: P;
}

export interface SyncTable<T, P> {
  [SyncKey]: {
    db: SyncDB;
    tableName: string;
    storage: {
      primary: BTree<string, T>;
    };
    options: Required<TableOptions<P>>;
  };
}
