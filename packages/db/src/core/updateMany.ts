import { middleware } from "../events/Middleware";
import { Entity, isOrdinal, PrimaryKeyOf } from "../types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { InvalidPrimaryKeyError, ItemNotFoundError } from "./errors";
import { Diff } from "./update";

/**
 * Saves updates of the given entities in the `table`.
 *
 * @throws if one of the entities has not been inserted into the table before,
 * e.g. if the primary key of the entity was not found.
 *
 * @returns the primary key of the updated entities,
 * in the same order as the items.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * const bobId = await insert(userTable, { id: uuid(), name: "Bob", age: 45 });
 * // Increase the age of Alice
 * await updateMany(userTable, [
 *   { id: aliceId, age: 16 },
 *   { id: bobId, age: 45 }
 * ]);
 */
export function updateMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  diffs: Diff<T, P>[]
): Promise<T[P][]> {
  return Promise.resolve(
    middleware<T, P, "updateMany">(
      table,
      { action: "updateMany", params: [table, diffs] },
      (table, diffs) => internalUpdateMany(table, diffs)
    )
  );
}

export function internalUpdateMany<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  diffs: Diff<T, P>[]
): Promise<T[P][]> {
  const primaryKeys: T[P][] = [];
  const events: { oldEntity: T; newEntity: T }[] = [];
  for (const diff of diffs) {
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = diff[primaryKeyProperty] as T[P];

    if (primaryKey === undefined || primaryKey === null) {
      return Promise.reject(new InvalidPrimaryKeyError(primaryKey));
    }

    const item = table[BlinkKey].storage.primary.get(primaryKey);

    if (item === undefined || item === null) {
      return Promise.reject(new ItemNotFoundError<T, P>(primaryKey));
    }

    const oldItem = clone(item);

    let key: keyof Diff<T, P>;
    for (key in diff) {
      if (key !== primaryKeyProperty) {
        item[key] = diff[key];
        const oldVal = oldItem[key as keyof T];
        const newVal = item[key as keyof T];
        if (oldVal !== item[key]) {
          key = key as keyof T;
          const btree = table[BlinkKey].storage.indexes[key];
          if (btree !== undefined && isOrdinal(oldVal) && isOrdinal(newVal)) {
            let oldIndexItems = btree.get(oldVal)!;
            const arrayIndex = oldIndexItems.indexOf(item);
            // This condition is only false if clone is disabled and the user changed the indexed property without calling update
            if (arrayIndex !== -1) {
              oldIndexItems.splice(arrayIndex, 1);
            }

            const newIndexItems = btree.get(newVal);
            if (newIndexItems !== undefined) {
              newIndexItems.push(item);
            } else {
              btree.set(newVal, [item]);
            }
          }
        }
      }
    }
    primaryKeys.push(primaryKey);
    events.push({ oldEntity: oldItem, newEntity: item });
  }
  void table[BlinkKey].events.onUpdate.dispatch(events);
  return Promise.resolve(primaryKeys);
}
