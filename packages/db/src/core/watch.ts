import { middleware } from "../events/Middleware";
import { matches } from "../query/filter";
import { limitItems } from "../query/limit";
import { insertIntoSortedList } from "../query/sort";
import { Query, ValidSortKey } from "../query/types";
import { EntityWithPk, PrimaryKeyProps } from "../types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { internalMany } from "./many";

/**
 * Watches all changes in `table` and calls `callback` whenever entities are inserted, updated, or removed.
 *
 * The callback is called once immediately after registering with all current entities in the `table`.
 *
 * @returns a function to be called if you want to stop watching changes.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // This will output 'List of all users: []'
 * await watch(userTable, (users) => {
 *   console.log('List of all users: ', users);
 * });
 * // This will output 'List of all users: [{ id: "some-uuid", name: "Alice" }]'
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice' });
 * // This will output 'List of all users: [{ id: "some-uuid", name: "Bob" }]'
 * await update(userTable, { id: userId, name: 'Bob' });
 * // This will output 'List of all users: []'
 * await remove(userTable, { id: userId });
 */
export async function watch<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  callback: (entities: T[]) => Promise<void> | void
): Promise<() => void>;

/**
 * Watches all changes in `table` and calls `callback` whenever entities
 * that match the given `filter` are inserted, updated, or removed.
 *
 * The callback is called once immediately after registering with all
 * current entities in the `table` that match the given `filter`.
 *
 * @returns a function to be called if you want to stop watching changes.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // This will output 'List of all babies: []'
 * await watch(userTable, { age: { lt: 3 } }, (users) => {
 *   console.log('List of all babies: ', users);
 * });
 * // This will output 'List of all babies: [{ id: "some-uuid", name: "Alice" }]'
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 2 });
 * // This will output 'List of all babies: []'
 * await update(userTable, { id: userId, age: 40 });
 * // This won't output anything
 * await remove(userTable, { id: userId });
 */
export async function watch<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  query: Query<T, P>,
  callback: (entities: T[]) => Promise<void> | void
): Promise<() => void>;

export async function watch<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  queryOrCallback: Query<T, P> | ((entities: T[]) => Promise<void> | void),
  callback?: (entities: T[]) => Promise<void> | void
): Promise<() => void> {
  let query: Query<T, P> | undefined;
  let cb: (entities: T[]) => Promise<void> | void;

  if (typeof queryOrCallback === "object") {
    query = queryOrCallback;
    cb = callback!;
  } else {
    query = undefined;
    cb = queryOrCallback;
  }

  const primaryKeyProperty = table[BlinkKey].options.primary;

  function sanitize(items: T[]): T[] {
    return table[BlinkKey].db[BlinkKey].options.clone ? clone(items) : items;
  }

  function sort(items: T[]): T[] {
    if (!query?.limit?.from) return items;
    return items.filter((i) => i[primaryKeyProperty] >= query!.limit!.from!);
  }

  function limit(items: T[]): T[] {
    if (!query?.limit) return items;
    return limitItems(table, items, query.limit, true);
  }

  function insertIntoEntityList(item: T): void {
    insertIntoSortedList(
      entities,
      item,
      query?.sort ?? {
        key: primaryKeyProperty as unknown as ValidSortKey<T>,
        order: "asc",
      }
    );
  }

  // Retrieve initial entities
  let entities = await middleware<T, P, "watch">(
    table,
    {
      action: "watch",
      params: [
        table,
        {
          where: query?.where,
          sort: query?.sort,
          limit: query?.limit
            ? { ...query?.limit, take: undefined, skip: undefined }
            : undefined,
        },
      ],
    },
    (table, query) => internalMany(table, query)
  );
  cb(sanitize(limit(sort(entities))));

  const removeOnInsertCb = table[BlinkKey].events.onInsert.register((changes) => {
    let entitiesHaveChanged = false;
    for (const change of changes) {
      const entity = change.entity;
      if (query?.where && !matches(entity, query.where)) {
        continue;
      }
      insertIntoEntityList(entity);
      entitiesHaveChanged = true;
    }
    if (entitiesHaveChanged) {
      cb(sanitize(limit(sort(entities))));
    }
  });

  const removeOnUpdateCb = table[BlinkKey].events.onUpdate.register((changes) => {
    let entitiesHaveChanged = false;
    for (const change of changes) {
      const oldEntity = change.oldEntity;
      const newEntity = change.newEntity;
      const matchesOldEntity = !query?.where || matches(oldEntity, query.where);
      const matchesNewEntity = !query?.where || matches(newEntity, query.where);
      if (!matchesOldEntity && !matchesNewEntity) {
        continue;
      } else if (matchesOldEntity && !matchesNewEntity) {
        const primaryKey = oldEntity[primaryKeyProperty];
        entities = entities.filter((e) => e[primaryKeyProperty] !== primaryKey);
      } else if (!matchesOldEntity && matchesNewEntity) {
        insertIntoEntityList(newEntity);
      } else if (matchesOldEntity && matchesNewEntity) {
        const primaryKey = newEntity[primaryKeyProperty];
        const entityInArray = entities.find((e) => e[primaryKeyProperty] === primaryKey);
        if (entityInArray) {
          for (const prop in entityInArray) {
            entityInArray[prop] = newEntity[prop];
          }
        }
      }
      entitiesHaveChanged = true;
    }

    if (entitiesHaveChanged) {
      cb(sanitize(limit(sort(entities))));
    }
  });

  const removeOnRemoveCb = table[BlinkKey].events.onRemove.register((changes) => {
    let entitiesHaveChanged = false;
    for (const change of changes) {
      const entity = change.entity;
      const primaryKey = entity[primaryKeyProperty];
      const index = entities.findIndex((e) => e[primaryKeyProperty] === primaryKey);
      if (index !== -1) {
        entities.splice(index, 1);
        entitiesHaveChanged = true;
      }
    }
    if (entitiesHaveChanged) {
      cb(sanitize(limit(sort(entities))));
    }
  });

  const removeOnClearCb = table[BlinkKey].events.onClear.register(() => {
    entities = [];
    cb([]);
  });

  return () => {
    removeOnInsertCb();
    removeOnUpdateCb();
    removeOnRemoveCb();
    removeOnClearCb();
  };
}
