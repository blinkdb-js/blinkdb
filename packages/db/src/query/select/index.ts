/**
 * @file The selecting engine for BlinkDB.
 *
 * Querying items from the database happens in two stages:
 *
 *  - First, the given filter is evaluated in order to determine how items from the database
 *    are to be loaded. Some queries must scan the whole table, others can use an index
 *    so that not every row needs to be checked against the filter.
 *
 * This happens in this `query/select` module.
 *
 *  - Once all items from the db have been loaded, they are checked against the filter to see
 *    if they match. Only matching items are returned to the user.
 *
 * This is implemented in the `query/filter` module.
 */

import { BlinkKey, Table } from "../../core";
import { Filter } from "../types";
import { selectAndFilterItems } from "./and";
import { selectOrFilterItems } from "./or";
import { selectWhereFilterItems } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectItems<T, P extends keyof T>(
  table: Table<T, P>,
  where: NonNullable<Filter<T, P>["where"]>
): Promise<T[]> {
  let possibleItems: T[] | null;

  if ("$and" in where) {
    possibleItems = await selectAndFilterItems(table, where);
  } else if ("$or" in where) {
    possibleItems = await selectOrFilterItems(table, where);
  } else {
    possibleItems = await selectWhereFilterItems(table, where);
  }

  if (possibleItems) {
    // In case the where filter returned all items, success!
    return possibleItems;
  } else {
    // In case null is returned, a full table scan is required
    return table[BlinkKey].storage.primary.valuesArray();
  }
}
