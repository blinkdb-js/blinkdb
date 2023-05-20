/**
 * Result returned from a call to `useMany()`.
 */
export type QueryResult<T> = LoadingQueryResult<T> | DoneQueryResult<T>;

interface LoadingQueryResult<T> {
  data: undefined;
  state: "loading";
}

interface DoneQueryResult<T> {
  data: T;
  state: "done";
}