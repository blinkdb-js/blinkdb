import { LteMatcher, Ordinal } from "../../types";

export function matchesLte<T extends Ordinal>(value: T, matcher: LteMatcher<T>): boolean {
  return value! <= matcher.lte!;
}
