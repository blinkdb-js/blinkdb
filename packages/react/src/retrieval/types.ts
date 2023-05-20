/**
 * Result returned from a call to `useMany()`.
 */
export interface QueryResult<T> {
  /**
   * data returned by the query.
   */
  data: T|undefined;
}