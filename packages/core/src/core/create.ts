import { SyncKey } from "./createDB";
import { SyncTable } from "./table";

/**
 * Inserts a new entity into `table`.
 * @returns the primary key of the inserted entity.
 * 
 * @example
 * const db = createDB();
 * const userTable = table<User>(db, "users");
 * const alexId = create(userTable, { id: uuid(), name: "Alex", age: 23 });
 * const bobId = create(userTable, { id: uuid(), name: "Bob", age: 45 });
 * const charlieId = create(userTable, { id: uuid(), name: "Charlie", age: 34 });
 */
export async function create<T>(table: SyncTable<T>, entity: T): Promise<string> {
  const primaryKeyProperty = table[SyncKey].options.index as string;
  if (!(primaryKeyProperty in entity)) {
    if (primaryKeyProperty === "id") {
      throw new Error(`
        The default primary key for the ${table[SyncKey].tableName} table is 'id', but the created entity does not have this property.
        If you want to use a custom primary key, please use table(... , ... , { primary: '<your-primary-key>' }).
      `);
    } else {
      throw new Error(`
        Your primary key for the ${table[SyncKey].tableName} table is '${primaryKeyProperty}', but the created entity does not have this property.
      `);
    }
  }

  const primaryKey = (entity as any)[primaryKeyProperty];
  if (!primaryKey || typeof primaryKey !== "string") {
    throw new Error(`
      Your primary key for the ${table[SyncKey].tableName} table, '${primaryKeyProperty}', is not a string.
    `);
  }

  table[SyncKey].primaryKeyCache.set(primaryKey, entity, true);
  table[SyncKey].listeners.onEntityCreate.emit({ entity });
  return primaryKey;
}
