/**
 * @file The selecting engine for ThunderDB.
 * 
 * Querying items from the database happens in two stages:
 * 
 *  - First, the given filter is evaluated in order to determine how items from the database
 *    are to be loaded. Some queries must scan the whole table, others can use an index
 *    so that not every row needs to be checked against the filter.
 *  
 * This happens in the `query/select` module.
 * 
 *  - Once all items from the db have been loaded, they are checked against the filter to see
 *    if they match. Only matching items are returned to the user.
 * 
 * This is implemented in this `query/filter` module.
 */

import { SyncTable } from "../../core";
import { Filter } from "../types";
import { filterAndItems } from "./and";
import { filterOrItems } from "./or";
import { filterWhereItems } from "./where";

/**
 * @returns all items from `items` that match the given `filter`.
 */
 export function filterItems<T, P extends keyof T>(
  table: SyncTable<T, P>,
  items: T[],
  where: NonNullable<Filter<T>["where"]>
): T[] {
  if ("$and" in where) {
    return filterAndItems(table, items, where);
  } else if ("$or" in where) {
    return filterOrItems(table, items, where);
  } else {
    return filterWhereItems(items, where);
  }
}