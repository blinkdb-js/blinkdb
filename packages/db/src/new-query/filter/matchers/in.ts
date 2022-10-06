import equal from "fast-deep-equal";
import { InMatcher } from "../../types";
import { matchesEqMatcher } from "./eq";

export function matchesInMatcher<T>(value: T, matcher: InMatcher<T>): boolean {
  return matcher.$in.some((v) => matchesEqMatcher(v, value));
}
