import { middleware } from "../events/Middleware";
import { EntityWithPk, Ordinal, PrimaryKeyProps } from "../types";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";
import { Create } from "./insert";
import { internalInsertMany } from "./insertMany";
import { internalUpdateMany } from "./updateMany";

/**
 * For each given entity of `entities`, either updates the entity if it exists,
 * or inserts it into the table if it doesn't.
 *
 * @returns the primary key of the inserted/updated entities,
 * in the same order as the items.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = await insert(userTable, { id: uuid(), name: 'Alice', age: 15 });
 * // Increase the age of Alice & insert a new user
 * await upsertMany(userTable, [
 *   { id: aliceId, age: 16 },
 *   { id: uuid(), age: 45 }
 * ]);
 */
export async function upsertMany<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  entities: Create<T, P>[]
): Promise<T[P][]> {
  return middleware<T, P, "upsertMany">(
    table,
    { action: "upsertMany", params: [table, entities] },
    (table, entities) => internalUpsertMany(table, entities)
  );
}

export async function internalUpsertMany<
  T extends EntityWithPk<T>,
  P extends PrimaryKeyProps<T>
>(table: Table<T, P>, entities: Create<T, P>[]): Promise<T[P][]> {
  // Split entities into items to create & items to update
  // reduces the number of outgoing events to 2
  const items: { entity: Create<T, P>; method: "insert" | "update" }[] = [];
  const primaryKeyProperty = table[BlinkKey].options.primary;
  for (const entity of entities) {
    const primaryKey = entity[primaryKeyProperty] as T[P] & Ordinal;
    const primaryKeyExists = table[BlinkKey].storage.primary.has(primaryKey);
    items.push({ entity, method: primaryKeyExists ? "update" : "insert" });
  }

  // Insert all items that need to be inserted, update all that need to be updated
  const itemsToInsert = items.filter((i) => i.method === "insert");
  const itemsToUpdate = items.filter((i) => i.method === "update");
  const insertIds = await internalInsertMany(
    table,
    itemsToInsert.map((i) => i.entity)
  );
  const updateIds = await internalUpdateMany(
    table,
    itemsToUpdate.map((i) => i.entity)
  );

  // Return the indexes in the correct order
  const ids: T[P][] = [];
  let insertIdsIndex = 0;
  let updateIdsIndex = 0;
  for (const item of items) {
    switch (item.method) {
      case "insert":
        ids.push(insertIds[insertIdsIndex]);
        insertIdsIndex++;
        break;
      case "update":
        ids.push(updateIds[updateIdsIndex]);
        updateIdsIndex++;
    }
  }

  return ids;
}
