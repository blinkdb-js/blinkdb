import { ContainsMatcher } from "../../types";
import { matchesEqMatcher } from "./eq";

export function matchesContainsMatcher<T>(
  value: T[],
  matcher: ContainsMatcher<T>
): boolean {
  return value.some((v) => matchesEqMatcher(v, matcher.$contains));
}
