export type Filter<T> = {
    where?: WhereFilter<T>;
};

export type WhereFilter<T> = {
    [K in keyof T]?: ValueMatchers<T[K]>;
}

export type ValueMatchers<T> = T extends string ? StringValueMatchers<T> : GenericValueMatchers<T>;

export type GenericValueMatchers<T> = EqualsValueMatcher<T>;
export type StringValueMatchers<T extends string> = GenericValueMatchers<T>;

export type EqualsValueMatcher<T> = SimpleEqualsValueMatcher<T> | ComplexEqualsValueMatcher<T>;
export type SimpleEqualsValueMatcher<T> = T;
export type ComplexEqualsValueMatcher<T> = { $equals: T };