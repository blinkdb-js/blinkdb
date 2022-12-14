import hyperid from "hyperid";

const instance = hyperid();

/**
 * Returns a unique uuid. You can use this as the primary key for entities.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * const aliceId = insert(userTable, { id: uuid(), name: "Alice", age: 23 });
 */
export function uuid() {
  return instance();
}
