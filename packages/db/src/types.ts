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

export function isOrdinal(val: unknown): val is Ordinal {
  const t = typeof val;
  return (
    t === "string" ||
    t === "number" ||
    t === "bigint" ||
    val === null ||
    val === undefined ||
    val instanceof Date
  );
}

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
export type PrimaryKeyOf<T> = keyof T &
  {
    [Key in keyof T]: T[Key] extends PrimaryKey ? Key : never;
  }[keyof T];

/**
 * An object with a primary key.
 */
export type Entity<T> = Record<PrimaryKeyOf<T>, PrimaryKey>;

/**
 * Returns type T if T only contains valid properties.
 */
export type ValidEntity<T> = T extends ValidProperties<T> ? T : never;
export type ValidProperties<T> = T extends Function | Symbol
  ? never
  : T extends Date
  ? T
  : T extends BigInt
  ? T
  : T extends object
  ? { [K in keyof T]: ValidEntity<T[K]> }
  : T;

/**
 * Returns true if the given object is a valid entity.
 *
 * @example
 * assert(isValidEntity({ a: "" }) === true);
 * assert(isValidEntity({ b: () => {} }) === false);
 */
export const isValidEntity = <T>(obj: T): obj is ValidEntity<T> => {
  if (typeof obj === "function") return false;
  if (typeof obj === "symbol") return false;
  if (obj instanceof Date) return true;
  if (typeof obj === "bigint") return true;
  if (typeof obj === "object") {
    for (const key in obj) {
      if (!isValidEntity(obj[key])) return false;
    }
    return true;
  }
  return true;
};
