import { filterItems } from "../query/filter";
import { sortItems } from "../query/sort";
import { Filter } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { many } from "./many";

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
 * watch(userTable, (users) => {
 *   console.log('List of all users: ', users);
 * });
 * // This will output 'List of all users: [{ id: "some-uuid", name: "Alice" }]'
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice' });
 * // This will output 'List of all users: [{ id: "some-uuid", name: "Bob" }]'
 * await update(userTable, { id: userId, name: 'Bob' });
 * // This will output 'List of all users: []'
 * await remove(userTable, { id: userId });
 */
export async function watch<T, P extends keyof T>(
  table: Table<T, P>,
  callback: (entities: T[]) => Promise<void> | void
): Promise<{ stop: () => void }>;

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
 * watch(userTable, { age: { $lt: 3 } }, (users) => {
 *   console.log('List of all babies: ', users);
 * });
 * // This will output 'List of all babies: [{ id: "some-uuid", name: "Alice" }]'
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 2 });
 * // This will output 'List of all babies: []'
 * await update(userTable, { id: userId, age: 40 });
 * // This won't output anything
 * await remove(userTable, { id: userId });
 */
export async function watch<T, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T, P>,
  callback: (entities: T[]) => Promise<void> | void
): Promise<{ stop: () => void }>;

export async function watch<T, P extends keyof T>(
  table: Table<T, P>,
  filterOrCallback: Filter<T, P> | ((entities: T[]) => Promise<void> | void),
  callback?: (entities: T[]) => Promise<void> | void
): Promise<{ stop: () => void }> {
  let filter: Filter<T, P> | undefined;
  let cb: (entities: T[]) => Promise<void> | void;
  if (typeof filterOrCallback === "object") {
    filter = filterOrCallback;
    cb = callback!;
  } else {
    filter = undefined;
    cb = filterOrCallback;
  }

  const primaryKeyProperty = table[BlinkKey].options.primary;

  let initialEntities = await many(table, filter);
  if (filter?.sort) {
    initialEntities = sortItems(initialEntities, filter.sort);
  }
  table[BlinkKey].db[BlinkKey].options.clone
    ? cb(clone(initialEntities))
    : cb(initialEntities);

  let entities: Map<T[P], T> = new Map();
  let entityList: T[] = initialEntities;
  for (let entity of initialEntities) {
    const primaryKey = entity[primaryKeyProperty];
    entities.set(primaryKey, entity);
  }

  const removeOnInsertCb = table[BlinkKey].events.onInsert.register(({ entity }) => {
    if (filter?.where && filterItems(table, [entity], filter.where).length === 0) {
      return;
    }

    const primaryKey = entity[primaryKeyProperty];
    entities.set(primaryKey, entity);
    entityList.push(entity);
    if (filter?.sort) {
      entityList = sortItems(entityList, filter.sort);
    }

    table[BlinkKey].db[BlinkKey].options.clone ? cb(clone(entityList)) : cb(entityList);
  });

  const removeOnUpdateCb = table[BlinkKey].events.onUpdate.register(
    ({ oldEntity, newEntity }) => {
      const matchesOldEntity =
        !filter?.where || filterItems(table, [oldEntity], filter.where).length !== 0;
      const matchesNewEntity =
        !filter?.where || filterItems(table, [newEntity], filter.where).length !== 0;
      if (!matchesOldEntity && !matchesNewEntity) {
        return;
      } else if (matchesOldEntity && !matchesNewEntity) {
        const primaryKey = oldEntity[primaryKeyProperty];
        entities.delete(primaryKey);
        entityList = Array.from(entities.values());
      } else if (!matchesOldEntity && matchesNewEntity) {
        const primaryKey = newEntity[primaryKeyProperty];
        entities.set(primaryKey, newEntity);
        entityList.push(newEntity);
      } else if (matchesOldEntity && matchesNewEntity) {
        const primaryKey = newEntity[primaryKeyProperty];
        entities.set(primaryKey, newEntity);
        entityList = Array.from(entities.values());
      }

      if (filter?.sort) {
        entityList = sortItems(entityList, filter.sort);
      }

      table[BlinkKey].db[BlinkKey].options.clone ? cb(clone(entityList)) : cb(entityList);
    }
  );

  const removeOnRemoveCb = table[BlinkKey].events.onRemove.register(({ entity }) => {
    const primaryKey = entity[primaryKeyProperty];
    const deleted = entities.delete(primaryKey);
    if (deleted) {
      entityList = Array.from(entities.values());
      if (filter?.sort) {
        entityList = sortItems(entityList, filter.sort);
      }
      table[BlinkKey].db[BlinkKey].options.clone ? cb(clone(entityList)) : cb(entityList);
    }
  });

  const removeOnClearCb = table[BlinkKey].events.onClear.register(() => {
    entities.clear();
    entityList = [];

    cb(entityList);
  });

  return {
    stop: () => {
      removeOnInsertCb();
      removeOnUpdateCb();
      removeOnRemoveCb();
      removeOnClearCb();
    },
  };
}
