import { OrdProps } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { Diff } from "./update";

/**
 * Saves updates of the given entities in the `table`.
 *
 * @throws if one of the entities has not been inserted into the table before,
 * e.g. if the primary key of the entity was not found.
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
export async function updateMany<T extends object, P extends keyof T>(
  table: Table<T, P>,
  diffs: Diff<T, P>[]
): Promise<void> {
  const events: { oldEntity: T; newEntity: T }[] = [];
  for (const diff of diffs) {
    const primaryKeyProperty = table[BlinkKey].options.primary;
    const primaryKey = diff[primaryKeyProperty] as T[P] & OrdProps;

    if (primaryKey === undefined || primaryKey === null) {
      throw new Error(`"${primaryKey}" is an invalid primary key value.`);
    }

    const item = table[BlinkKey].storage.primary.get(primaryKey);

    if (item === undefined || item === null) {
      throw new Error(`Item with primary key "${primaryKey}" not found.`);
    }

    const oldItem = clone(item);

    let key: keyof Diff<T, P>;
    for (key in diff) {
      if (key !== primaryKeyProperty) {
        item[key] = diff[key];
        if (oldItem[key] !== item[key]) {
          const btree = table[BlinkKey].storage.indexes[key as keyof T];
          if (btree !== undefined) {
            let oldIndexItems = btree.get(oldItem[key] as T[typeof key] & OrdProps)!;
            const arrayIndex = oldIndexItems.indexOf(item);
            // This condition is only false if clone is disabled and the user changed the indexed property without calling update
            if (arrayIndex !== -1) {
              oldIndexItems.splice(arrayIndex, 1);
            }

            const newIndexItems = btree.get(item[key] as T[typeof key] & OrdProps);
            if (newIndexItems !== undefined) {
              newIndexItems.push(item);
            } else {
              btree.set(item[key] as T[typeof key] & OrdProps, [item]);
            }
          }
        }
      }
    }
    events.push({ oldEntity: oldItem, newEntity: item });
  }

  table[BlinkKey].events.onUpdate.dispatch(events);
}
