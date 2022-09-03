import BTree from "sorted-btree";
import { Dispatcher } from "../events/Dispatcher";
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
  return <P extends keyof T>(options: TableOptions<P>): SyncTable<T, P> => {
    return {
      [SyncKey]: {
        db,
        tableName,
        storage: {
          primary: new BTree(),
        },
        events: {
          onClear: new Dispatcher(),
          onInsert: new Dispatcher(),
          onRemove: new Dispatcher(),
          onUpdate: new Dispatcher()
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

export interface SyncTable<T, P extends keyof T> {
  [SyncKey]: {
    db: SyncDB;
    tableName: string;
    storage: {
      primary: BTree<T[P], T>;
    };
    events: {
      onInsert: Dispatcher<{ entity: T }>,
      onUpdate: Dispatcher<{ oldEntity: T, newEntity: T }>,
      onRemove: Dispatcher<{ entity: T }>
      onClear: Dispatcher
    },
    options: Required<TableOptions<P>>;
  };
}
