import { Ordinal } from "../../../types";
import { LteMatcher } from "../../types";

export function matchesLte<T extends Ordinal>(value: T, matcher: LteMatcher<T>): boolean {
  return value! <= matcher.lte!;
}
