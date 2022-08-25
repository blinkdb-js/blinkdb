export type Filter<T> = {
  where?: WhereFilter<T>;
};

export type WhereFilter<T> = {
  [K in keyof T]?: Matchers<T[K]>;
};

export type Matchers<T> = T extends string
  ? StringMatchers<T>
  : T extends number
  ? NumberMatchers<T>
  : GenericMatchers<T>;

export type GenericMatchers<T> = EqualsMatcher<T>;

export type EqualsMatcher<T> = SimpleEqualsMatcher<T> | ComplexEqualsMatcher<T>;
export type SimpleEqualsMatcher<T> = T;
export type ComplexEqualsMatcher<T> = { $equals: T };

export type StringMatchers<T extends string> =
  | GtMatcher<T>
  | GteMatcher<T>
  | LtMatcher<T>
  | LteMatcher<T>
  | GenericMatchers<T>;

export type NumberMatchers<T extends number> =
  | GtMatcher<T>
  | GteMatcher<T>
  | LtMatcher<T>
  | LteMatcher<T>
  | GenericMatchers<T>;

export type GtMatcher<T extends string | number> = { $gt: T };
export type GteMatcher<T extends string | number> = { $gte: T };
export type LtMatcher<T extends string | number> = { $lt: T };
export type LteMatcher<T extends string | number> = { $lte: T };
