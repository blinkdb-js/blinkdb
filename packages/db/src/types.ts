/**
 * Valid types of entity properties.
 *
 * BlinkDB doesn't allow functions or Symbols as valid properties
 * in entities.
 */
export type EntityPropTypes =
  | string
  | boolean
  | number
  | null
  | undefined
  | BigInt
  | Date
  | unknown[]
  | object;

/**
 * Types that can be ordered with >, >=, <, and <= operations.
 */
export type Ordinal = string | number | null | undefined | BigInt | Date;

/**
 * Types comparable by equality with `deepEqual(a, b)`.
 */
export type Eq = EntityPropTypes;

/**
 * Types comparable by simple equality with `a === b`.
 */
export type SimpleEq = string | boolean | number | null | undefined | Date;

/**
 * Types valid for a primary key.
 */
type PrimaryKey = string | number;

/**
 * Select only properties valid for a primary key of a given object.
 */
export type PrimaryKeyProps<T> = keyof T &
  {
    [Key in keyof T]: T[Key] extends PrimaryKey ? Key : never;
  }[keyof T];

/**
 * An object with a primary key.
 */
export type EntityWithPk<T> = Record<PrimaryKeyProps<T>, PrimaryKey>;
