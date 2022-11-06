import equal from "fast-deep-equal";

export function matchesEq<T>(value: T, matcher: T): boolean {
  if (value instanceof Date && matcher instanceof Date) {
    return value.getTime() === matcher.getTime();
  }

  let newVal = value;
  let newMatcher = matcher;

  if (Array.isArray(value)) {
    newVal = [...value].sort() as T;
  }
  if (Array.isArray(matcher)) {
    newMatcher = [...matcher].sort() as T;
  }

  return equal(newVal, newMatcher);
}
