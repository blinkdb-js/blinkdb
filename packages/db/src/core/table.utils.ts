import { clone } from "./clone";
import { BlinkKey } from "./createDB";
import { Table } from "./createTable";

export namespace TableUtils {
  /**
   * Clones the supplied object if `clone = true` was passed
   * when the database of the table was created with `createDB()`.
   */
  export function cloneIfNecessary<T>(table: Table<any, any>, obj: T): T {
    return table[BlinkKey].db[BlinkKey].options.clone ? clone(obj) : obj;
  }
}
