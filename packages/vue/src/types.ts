/**
 * Result returned from a call to `watchMany()`.
 */
export type QueryResult<T> =
  | LoadingQueryResult<T>
  | DoneQueryResult<T>
  | ErrorQueryResult<T>;

interface LoadingQueryResult<T> {
  data: undefined;
  error: undefined;
  state: "loading";
}

interface DoneQueryResult<T> {
  data: T;
  error: undefined;
  state: "done";
}

interface ErrorQueryResult<T> {
  data: undefined;
  error: Error;
  state: "error";
}
