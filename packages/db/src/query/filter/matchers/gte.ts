import { Ordinal } from "../../../types";
import { GteMatcher } from "../../types";

export function matchesGte<T extends Ordinal>(value: T, matcher: GteMatcher<T>): boolean {
  return value! >= matcher.gte!;
}
