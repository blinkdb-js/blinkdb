import { matchesMatcher } from ".";
import { SubWhere } from "../../types";

export function matchesSubWhereMatcher<T>(value: T, matcher: SubWhere<T>): boolean {
  for (const propKey in matcher) {
    if (!matchesMatcher(value[propKey], matcher[propKey])) {
      return false;
    }
  }
  return true;
}
