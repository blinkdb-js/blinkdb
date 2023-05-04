import { GtMatcher, Ordinal } from "../../types";

export function matchesGt<T extends Ordinal>(value: T, matcher: GtMatcher<T>): boolean {
  return value! > matcher.gt!;
}
