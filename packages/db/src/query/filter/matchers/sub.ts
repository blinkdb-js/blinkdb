import { matches } from ".";
import { ObjMatchers } from "../../types";

export function matchesSubWhere<T>(value: T, matcher: ObjMatchers<T>): boolean {
  for (const propKey in matcher.where) {
    if (!matches(value[propKey], matcher.where[propKey])) {
      return false;
    }
  }
  return true;
}
