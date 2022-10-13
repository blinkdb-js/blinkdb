import { matches } from ".";
import { SubWhere } from "../../types";

export function matchesSubWhere<T>(value: T, matcher: SubWhere<T>): boolean {
  for (const propKey in matcher) {
    if (!matches(value[propKey], matcher[propKey])) {
      return false;
    }
  }
  return true;
}
