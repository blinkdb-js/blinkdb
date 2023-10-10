/**
 * Result returned from a call to `watchMany()`.
 */
export type QueryResult<T> = LoadingQueryResult | DoneQueryResult<T> | ErrorQueryResult;

interface LoadingQueryResult {
  data: undefined;
  error: undefined;
  state: "loading";
}

interface DoneQueryResult<T> {
  data: T;
  error: undefined;
  state: "done";
}

interface ErrorQueryResult {
  data: undefined;
  error: Error;
  state: "error";
}
