import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

/**
 * Saves updates of the given `entity` in `table`.
 *
 * @throws if the entity has not been inserted into the table before, e.g. if the primary key of the entity was not found.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Increase the age of Alice
 * await update(userTable, { id: userId, age: 16 });
 */
export async function update<T, P extends keyof T>(
  table: Table<T, P>,
  diff: Diff<T, P>
): Promise<void> {
  const primaryKeyProperty = table[BlinkKey].options.primary;
  const primaryKey = diff[primaryKeyProperty] as unknown as T[P];
  const item = table[BlinkKey].storage.primary.get(primaryKey);

  if (item === undefined || item === null) {
    throw new Error(`Item with primary key "${primaryKey}" not found.`);
  }

  const oldItem = clone(item);
  for (let key in diff) {
    if (key === primaryKeyProperty) {
      continue;
    }
    item[key as keyof T] = diff[key as keyof Diff<T, P>] as any;
    if (oldItem[key as keyof T] !== diff[key as keyof Diff<T, P>]) {
      const btree = table[BlinkKey].storage.indexes[key as keyof T];
      if (btree !== undefined) {
        let oldIndexItems = btree.get(oldItem[key as keyof T])!;
        oldIndexItems = oldIndexItems?.filter(
          (i) => i[primaryKeyProperty] !== oldItem[primaryKeyProperty]
        );
        btree.set(oldItem[key as keyof T], oldIndexItems);
        const newIndexItems = btree.get(diff[key as keyof Diff<T, P>] as T[keyof T]);
        btree.set(
          diff[key as keyof Diff<T, P>] as T[keyof T],
          newIndexItems ? [...newIndexItems, item] : [item]
        );
      }
    }
  }

  table[BlinkKey].events.onUpdate.dispatch({ oldEntity: oldItem, newEntity: item });
}

export type Diff<T, P extends keyof T> = Partial<Omit<T, P>> & Required<Pick<T, P>>;
