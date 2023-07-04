import { middleware } from "../events/Middleware";
import { get } from "../query";
import { Filter } from "../query/types";
import { Entity, PrimaryKeyOf } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { PrimaryKeyCannotBeModifiedError } from "./errors";
import { TableUtils } from "./table.utils";
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
export async function updateWhere<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  filter: Filter<T>,
  callback: (item: T) => Diff<T, P> | Promise<Diff<T, P>>
): Promise<void> {
  return middleware<T, P, "updateWhere">(
    table,
    { action: "updateWhere", params: [table, filter, callback] },
    (table, filter, callback) => internalUpdateWhere(table, filter, callback)
  );
}

export async function internalUpdateWhere<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  filter: Filter<T>,
  callback: (item: T) => Diff<T, P> | Promise<Diff<T, P>>
): Promise<void> {
  const primaryKeyProperty = table[BlinkKey].options.primary;

  let items = get(table, filter);
  items = TableUtils.cloneIfNecessary(table, items);
  const modifiedItems = await Promise.all(
    items.map(async (item) => {
      const newItem = await callback(item);
      if (newItem[primaryKeyProperty] !== item[primaryKeyProperty]) {
        throw new PrimaryKeyCannotBeModifiedError(item[primaryKeyProperty]);
      }
      return newItem;
    })
  );
  await internalUpdateMany(table, modifiedItems);
}
