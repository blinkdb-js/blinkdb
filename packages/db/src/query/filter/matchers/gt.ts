import { GtMatcher, OrdProps } from "../../types";

export function matchesGt<T extends OrdProps>(value: T, matcher: GtMatcher<T>): boolean {
  return value! > matcher.gt!;
}
