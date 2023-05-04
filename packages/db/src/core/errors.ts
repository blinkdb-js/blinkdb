import { PrimaryKeyIndexable, PrimaryKeyProps, Query } from "../query/types";

/**
 * Thrown if the primary key of an item being inserted is already present within the table.
 */
export class PrimaryKeyAlreadyInUseError<T> extends Error {
  constructor(public readonly primaryKey: T) {
    super(`Primary key "${primaryKey}" already in use.`);
  }
}

/**
 * Thrown if an invalid value is given as a primary key.
 */
export class InvalidPrimaryKeyError<T> extends Error {
  constructor(public readonly primaryKey: T) {
    super(`"${primaryKey}" is an invalid primary key value.`);
  }
}

/**
 * Thrown if an invalid value is given as a primary key.
 */
export class PrimaryKeyCannotBeModifiedError<T> extends Error {
  constructor(public readonly primaryKey: T) {
    super(`Primary key "${primaryKey}" cannot be modified in update queries.`);
  }
}

/**
 * Thrown if a table retrieval method expects to find exactly one item, but finds none.
 */
export class ItemNotFoundError<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
> extends Error {
  constructor(public readonly queryOrId: Query<T, P> | T[P]) {
    super(`No item found for query "${queryOrId}".`);
  }
}

/**
 * Thrown if a table retrieval method expects to find exactly one item, but finds more than one.
 */
export class MoreThanOneItemFoundError<
  T extends PrimaryKeyIndexable<T>,
  P extends PrimaryKeyProps<T>
> extends Error {
  constructor(public readonly queryOrId: Query<T, P> | T[P]) {
    super(`More than one item found for query "${queryOrId}".`);
  }
}
