import BTree from "sorted-btree";
import { Dispatcher } from "../events/Dispatcher";
import { Hook } from "../events/types";
import { OrdProps, PrimaryKeyIndexable, PrimaryKeyProps } from "../query/types";
import { BlinkKey, Database } from "./createDB";

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
export function createTable<T extends { id: string | number } & PrimaryKeyIndexable<T>>(
  db: Database,
  tableName: string
): <
  P extends PrimaryKeyProps<T> & PrimaryKeyProps<ValidEntity<T>> = "id" &
    PrimaryKeyProps<T> &
    PrimaryKeyProps<ValidEntity<T>>
>(
  options?: TableOptions<T, P>
) => Table<ValidEntity<T>, P>;

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
export function createTable<T extends PrimaryKeyIndexable<T>>(
  db: Database,
  tableName: string
): <P extends PrimaryKeyProps<T> & PrimaryKeyProps<ValidEntity<T>>>(
  options: TableOptions<T, P>
) => Table<ValidEntity<T>, P>;

export function createTable<T extends PrimaryKeyIndexable<T>>(
  db: Database,
  tableName: string
) {
  return <P extends PrimaryKeyProps<T> & PrimaryKeyProps<ValidEntity<T>>>(
    options?: TableOptions<T, P>
  ): Table<ValidEntity<T>, P> => {
    const primaryBTree = new BTree();
    primaryBTree.totalItemSize = 0;
    const table: Table<ValidEntity<T>, P> = {
      [BlinkKey]: {
        db,
        tableName,
        storage: {
          primary: primaryBTree,
          indexes: (options?.indexes ?? []).reduce<IndexStorage<ValidEntity<T>>>(
            (prev, cur) => {
              const btree = new BTree();
              btree.totalItemSize = 0;
              return {
                ...prev,
                [cur]: btree,
              };
            },
            {}
          ),
        },
        events: {
          onClear: new Dispatcher(),
          onInsert: new Dispatcher(),
          onRemove: new Dispatcher(),
          onUpdate: new Dispatcher(),
        },
        hooks: [],
        options: {
          primary: options?.primary ?? ("id" as P),
          indexes: options?.indexes ?? [],
        },
      },
    };
    return table;
  };
}

export interface TableOptions<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
> {
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
  indexes?: Exclude<keyof T, P>[];
}

export interface Table<T extends PrimaryKeyIndexable<T>, P extends PrimaryKeyProps<T>> {
  [BlinkKey]: {
    db: Database;
    tableName: string;
    storage: {
      primary: BTree<T[P] & OrdProps, T>;
      indexes: IndexStorage<T>;
    };
    events: {
      onInsert: Dispatcher<{ entity: T }[]>;
      onUpdate: Dispatcher<{ oldEntity: T; newEntity: T }[]>;
      onRemove: Dispatcher<{ entity: T }[]>;
      onClear: Dispatcher;
    };
    hooks: Hook<T, P>[];
    options: Required<TableOptions<T, P>>;
  };
}

type IndexStorage<T> = {
  [Key in keyof T]?: BTree<T[Key] & OrdProps, T[]>;
};

/**
 * Returns type T if T only contains valid properties.
 */
type ValidEntity<T> = T extends ValidProperties<T> ? T : never;
export type ValidProperties<T> = T extends Function | Symbol
  ? never
  : T extends Date
  ? T
  : T extends BigInt
  ? T
  : T extends object
  ? { [K in keyof T]: ValidEntity<T[K]> }
  : T;
