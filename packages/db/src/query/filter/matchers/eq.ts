import equal from "fast-deep-equal";

export function matchesEq<T>(value: T, matcher: T): boolean {
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
