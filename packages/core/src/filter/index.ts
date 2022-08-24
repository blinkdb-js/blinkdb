export type Filter<T> = {
    where?: WhereFilter<T>;
};

export type WhereFilter<T> = {
    [K in keyof T]?: T[K];
}