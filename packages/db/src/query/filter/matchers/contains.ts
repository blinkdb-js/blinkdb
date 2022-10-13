import { ContainsMatcher } from "../../types";
import { matchesEq } from "./eq";

export function matchesContains<T>(value: T[], matcher: ContainsMatcher<T>): boolean {
  return value.some((v) => matchesEq(v, matcher.$contains));
}
