import { LtMatcher, Ordinal } from "../../types";

export function matchesLt<T extends Ordinal>(value: T, matcher: LtMatcher<T>): boolean {
  return value! < matcher.lt!;
}
