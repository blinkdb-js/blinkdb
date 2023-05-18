import { Database, Table } from "blinkdb";

/**
 * A nested object containing all tables used by BlinkDB.
 *
 * @example
 * export const model = (db) => ({
 *   users: createTable<User>(db, "users")(),
 *   // Nested tables work too!
 *   posts: {
 *     posts: createTable<Post>(db, "posts")(),
 *     images: createTable<PostImages>(db, "postImages")()
 *   }
 * }) satisfies ValidModel;
 *
 * type Model = ModelOf<typeof model>;
 */
export type ValidModel = ModelTables | ((db: Database) => ModelTables);

/**
 * Creates the Model type from a valid model.
 *
 * @example
 * export const model = (db) => ({
 *   users: createTable<User>(db, "users")(),
 *   // Nested tables work too!
 *   posts: {
 *     posts: createTable<Post>(db, "posts")(),
 *     images: createTable<PostImages>(db, "postImages")()
 *   }
 * }) satisfies ValidModel;
 *
 * type Model = ModelOf<typeof model>;
 */
export type ModelOf<T extends ValidModel> = T extends (...args: any) => infer R ? R : T;

interface ModelTables {
  [x: string]: ModelTables | Table<any, any>;
}
