import equal from "fast-deep-equal";
import { ContainsMatcher } from "../../types";

export function matchesContainsMatcher<T>(
  value: T[],
  matcher: ContainsMatcher<T>
): boolean {
  return value.some((v) => equal(matcher.$contains, v));
}
