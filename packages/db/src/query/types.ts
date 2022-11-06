/**
 * Specifies what and how items should be returned from a query.
 *
 * Used in calls to query functions like `many()`, `one()` or `first()`.
 */
export type Query<T, P extends keyof T> = {
  where?: Where<T> | Or<T> | And<T>;
  sort?: Sort<T>;
  limit?: Limit<T, P>;
};

/**
 * Specifies which items should be selected from the database.
 *
 * Used in calls to `watch()`.
 */
export type Filter<T> = {
  where?: Where<T> | Or<T> | And<T>;
};

/**
 * Will select all items where the given item
 * matches all of the supplied filters.
 */
export type And<T> = {
  AND: (Where<T> | Or<T>)[];
};

/**
 * Will select all items where the given item
 * matches one of the supplied filters.
 */
export type Or<T> = {
  OR: (Where<T> | And<T>)[];
};

/**
 * Will select all items where the given item
 * matches all of the supplied matchers.
 */
export type Where<T> = {
  [K in keyof T]?: Matchers<T, K>;
};

/**
 * Will sort returned items according
 * to the key specified here, in either
 * ascending or descending order.
 */
export type Sort<T> = {
  key: ValidSortKey<T>;
  order: "asc" | "desc";
};

/**
 * Items can only be sorted by keys either of type
 * string, boolean, number, null, undefined, or date.
 */
export type ValidSortKey<T> = {
  [K in keyof T]: T[K] extends OrdProps ? K : never;
}[keyof T];

/**
 * Limits the number of keys returned.
 *
 * Search starts from `from`, will skip the first
 * `skip` items, and then take up to `take` items.
 */
export type Limit<T, P extends keyof T> = {
  from?: T[P];
  skip?: number;
  take?: number;
};

/**
 * Filters items according to the given matcher.
 *
 * The allowed matchers depend on the type of
 * the property filtered by.
 */
export type Matchers<T, K extends keyof T> = T[K] extends (infer R)[] | undefined
  ? ArrMatchers<R> | EqMatchers<T[K]>
  : T[K] extends OrdProps & EqProps & SimpleEqProps
  ? OrdMatchers<T[K]> | EqMatchers<T[K]> | T[K]
  : T[K] extends OrdProps & EqProps
  ? OrdMatchers<T[K]> | EqMatchers<T[K]>
  : T[K] extends EqProps & SimpleEqProps
  ? EqMatchers<T[K]> | T[K]
  : T[K] extends object | undefined
  ? ObjMatchers<T[K]> | EqMatchers<T[K]>
  : T[K] extends ValidProps
  ? EqMatchers<T[K]>
  : never;

/**
 * With a orderable property, one can use
 * gt, gte, lt, lte, and between matchers.
 */
export type OrdMatchers<T extends OrdProps> =
  | GtMatcher<T>
  | GteMatcher<T>
  | LtMatcher<T>
  | LteMatcher<T>
  | BetweenMatcher<T>;
export type GtMatcher<T extends OrdProps> = { gt: T };
export type GteMatcher<T extends OrdProps> = { gte: T };
export type LtMatcher<T extends OrdProps> = { lt: T };
export type LteMatcher<T extends OrdProps> = { lte: T };
export type BetweenMatcher<T extends OrdProps> = { between: [T, T] };

/**
 * With a property that supports equality, one can use
 * the equals and in matchers.
 */
export type EqMatchers<T> = EqMatcher<T> | InMatcher<T>;
export type EqMatcher<T> = { eq: T };
export type InMatcher<T> = { in: T[] };

/**
 * With an array property, one can use
 * the contains matcher.
 */
export type ArrMatchers<T> = ContainsMatcher<T>;
export type ContainsMatcher<T> = { contains: T };

/**
 * Allows nested wheres.
 */
export type ObjMatchers<T> = {
  where: Where<T>;
};

/**
 * BlinkDB doesn't allow functions or Symbols as valid properties
 * in entities.
 */
export type ValidProps =
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
 * Only some properties are orderable with >, >=, <, and <= operations.
 */
export type OrdProps = string | number | null | undefined | BigInt | Date;

/**
 * Only some properties are comparable by equality with `deepEqual(a, b)`.
 */
export type EqProps = ValidProps;

/**
 * Only some properties are comparable by simple equality with `a === b`.
 */
export type SimpleEqProps = string | boolean | number | null | undefined;
