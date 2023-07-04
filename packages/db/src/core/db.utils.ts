import { clone } from "./clone";
import { BlinkKey, Database } from "./createDB";

/**
 * Commonly used code snippets for the database.
 */
export namespace DbUtils {
  /**
   * Clones the supplied object if `clone = true` was passed
   * when the database was created with `createDB()`.
   */
  export function cloneIfNecessary<T>(db: Database, obj: T): T {
    return db[BlinkKey].options.clone ? clone(obj) : obj;
  }
}
