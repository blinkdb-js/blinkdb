import { Database, Table } from "blinkdb";

/**
 * A nested object containing all tables used by BlinkDB.
 *
 * @example
 * export const model: Model = (db) => ({
 *   users: createTable<User>(db, "users")(),
 *   // Nested tables work too!
 *   posts: {
 *     posts: createTable<Post>(db, "posts")(),
 *     images: createTable<PostImages>(db, "postImages")()
 *   }
 * });
 */
export type Model = ModelTables | ((db: Database) => ModelTables);

interface ModelTables {
  [x: string]: ModelTables | Table<any, any>;
}
