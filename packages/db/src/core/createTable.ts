import BTree from "sorted-btree";
import { Dispatcher } from "../events/Dispatcher";
import { Database, BlinkKey } from "./createDB";

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
  db: Database,
  tableName: string
): <P extends keyof T = "id">(options?: TableOptions<P, keyof T>) => Table<T, P>;

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
  db: Database,
  tableName: string
): <P extends keyof T>(options: TableOptions<P, keyof T>) => Table<T, P>;

export function createTable<T>(db: Database, tableName: string) {
  return <P extends keyof T>(options?: TableOptions<P, keyof T>): Table<T, P> => {
    return {
      [BlinkKey]: {
        db,
        tableName,
        storage: {
          primary: new BTree(),
          indexes: (options?.indexes ?? []).reduce<IndexStorage<T>>((prev, cur) => {
            return {
              ...prev,
              [cur]: new BTree(),
            };
          }, {}),
        },
        events: {
          onClear: new Dispatcher(),
          onInsert: new Dispatcher(),
          onRemove: new Dispatcher(),
          onUpdate: new Dispatcher(),
        },
        options: {
          primary: options?.primary ?? ("id" as P),
          indexes: options?.indexes ?? [],
        },
      },
    };
  };
}

export interface TableOptions<P, I> {
  /**
   * The primary key of the entity.
   *
   * Defaults to `id` if your entity has that property.
   */
  primary: P;
  /**
   * Properties on which BlinkDB should create an index.
   *
   * Indexes drastically increase query performance when you specify properties often used in filters,
   * but decrease write performance a bit.
   */
  indexes?: I[];
}

export interface Table<T, P extends keyof T> {
  [BlinkKey]: {
    db: Database;
    tableName: string;
    storage: {
      primary: BTree<T[P], T>;
      indexes: IndexStorage<T>;
    };
    events: {
      onInsert: Dispatcher<{ entity: T }>;
      onUpdate: Dispatcher<{ oldEntity: T; newEntity: T }>;
      onRemove: Dispatcher<{ entity: T }>;
      onClear: Dispatcher;
    };
    options: Required<TableOptions<P, keyof T>>;
  };
}

type IndexStorage<T> = {
  [Key in keyof T]?: BTree<T[Key], T[]>;
};
