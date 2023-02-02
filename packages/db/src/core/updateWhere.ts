import { executeTableHooks } from "../events/Middleware";
import { get } from "../query";
import { Filter } from "../query/types";
import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { Diff } from "./update";
import { internalUpdateMany } from "./updateMany";

/**
 * Modifies all entities that match the given `filter` using the provided `callback`.
 *
 * @throws if the primary key of an entity is modified in the `callback`.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const userId = await insert(userTable, { id: uuid(), name: 'Alice', age: 20 });
 * // Happy Birthday! Increase the age of all 20 year olds to 21
 * await updateWhere(userTable, { where: { age: 20 } }, (user) => {
 *   return { ...user, age: user.age + 1 };
 * });
 */
export async function updateWhere<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>,
  callback: (item: T) => Diff<T, P> | Promise<Diff<T, P>>
): Promise<void> {
  return executeTableHooks(
    table,
    { action: "updateWhere", params: [table, filter, callback] },
    () => internalUpdateWhere(table, filter, callback)
  );
}

export async function internalUpdateWhere<T extends object, P extends keyof T>(
  table: Table<T, P>,
  filter: Filter<T>,
  callback: (item: T) => Diff<T, P> | Promise<Diff<T, P>>
): Promise<void> {
  const primaryKeyProperty = table[BlinkKey].options.primary;

  let items = get(table, filter);
  items = table[BlinkKey].db[BlinkKey].options.clone ? clone(items) : items;
  const modifiedItems = await Promise.all(
    items.map(async (item) => {
      const newItem = await callback(item);
      if (newItem[primaryKeyProperty] !== item[primaryKeyProperty]) {
        throw new Error(`Primary key cannot be modified in update queries.`);
      }
      return newItem;
    })
  );
  return await internalUpdateMany(table, modifiedItems);
}
