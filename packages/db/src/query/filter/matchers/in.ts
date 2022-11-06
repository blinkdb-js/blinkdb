import { InMatcher } from "../../types";
import { matchesEq } from "./eq";

export function matchesIn<T>(value: T, matcher: InMatcher<T>): boolean {
  return matcher.in.some((v) => matchesEq(v, value));
}
