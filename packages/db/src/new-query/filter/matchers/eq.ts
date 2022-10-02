import equal from "fast-deep-equal";

export function matchesEqMatcher<T>(value: T, matcher: T): boolean {
  if (value instanceof Date && matcher instanceof Date) {
    return value.getTime() === matcher.getTime();
  }

  if (Array.isArray(value)) {
    value.sort();
  }
  if (Array.isArray(matcher)) {
    matcher.sort();
  }

  return equal(value, matcher);
}