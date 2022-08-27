import {
  GteMatcher,
  GtMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
} from "../types";

/**
 * @returns whether `property` matches `matcher`.
 */
export function matchesMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: Matchers<T[P]>
): boolean {
  if (typeof matcher === "object" && "$equals" in matcher) {
    return matchesEqMatcher(property, (matcher as { $equals: T[P] }).$equals);
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    return matchesGteMatcher(property, matcher as GteMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    return matchesGtMatcher(property, matcher as GtMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    return matchesLteMatcher(property, matcher as LteMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    return matchesLtMatcher(property, matcher as LtMatcher<T[P]>);
  } else {
    return matchesEqMatcher(property, matcher as T[P]);
  }
}

function matchesEqMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: T[P]
): boolean {
  return property === matcher;
}

function matchesGteMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: GteMatcher<T[P]>
): boolean {
  return property >= matcher.$gte;
}

function matchesGtMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: GtMatcher<T[P]>
): boolean {
  return property > matcher.$gt;
}

function matchesLteMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: LteMatcher<T[P]>
): boolean {
  return property <= matcher.$lte;
}

function matchesLtMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: LtMatcher<T[P]>
): boolean {
  return property < matcher.$lt;
}
