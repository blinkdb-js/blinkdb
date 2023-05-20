import { Table } from "../../core";
import { Entity, PrimaryKeyOf } from "../../types";
import { And, Or, Where } from "../types";
import { selectForAnd } from "./and";
import { selectForOr } from "./or";
import { SelectCallback, SelectResult } from "./types";
import { selectForWhere } from "./where";

/**
 * Select all items for `filter`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export function select<T extends Entity<T>, P extends PrimaryKeyOf<T>>(
  table: Table<T, P>,
  where: Where<T> | Or<T> | And<T>,
  cb: SelectCallback<T>,
  from?: T[P]
): SelectResult<T> {
  if ("AND" in where) {
    return selectForAnd(table, where, cb, from);
  } else if ("OR" in where) {
    return selectForOr(table, where, cb, from);
  } else {
    return selectForWhere(table, where, cb, from);
  }
}
