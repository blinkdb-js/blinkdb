import { Ordinal } from "../../../types";
import { LtMatcher } from "../../types";

export function matchesLt<T extends Ordinal>(value: T, matcher: LtMatcher<T>): boolean {
  return value! < matcher.lt!;
}
