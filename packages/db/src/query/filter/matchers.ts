import {
  BetweenMatcher,
  ContainsMatcher,
  GteMatcher,
  GtMatcher,
  InMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
  SubWhere,
} from "../types";
import equal from "fast-deep-equal";

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
  } else if (
    typeof matcher === "object" &&
    "$contains" in matcher &&
    Array.isArray(property)
  ) {
    return matchesContainsMatcher(property, matcher as ContainsMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$in" in matcher) {
    return matchesInMatcher(property, matcher as InMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$between" in matcher) {
    return matchesBetweenMatcher(property, matcher as BetweenMatcher<T[P]>);
  } else if (matcher instanceof Date && property instanceof Date) {
    return matchesEqMatcher(property, matcher as Date);
  } else if (typeof matcher === "object") {
    return matchesSubWhereMatcher(property, matcher as SubWhere<T[P]>);
  } else {
    return matchesEqMatcher(property, matcher as T[P]);
  }
}

function matchesEqMatcher<T>(property: T, matcher: T): boolean {
  if (property instanceof Date && matcher instanceof Date) {
    return equal(property.getTime(), matcher.getTime());
  }

  if (Array.isArray(property)) {
    property.sort();
  }
  if (Array.isArray(matcher)) {
    matcher.sort();
  }

  return equal(property, matcher);
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

function matchesContainsMatcher<T>(
  property: Array<T>,
  matcher: ContainsMatcher<T>
): boolean {
  return property.includes(matcher.$contains);
}

function matchesInMatcher<T>(property: T, matcher: InMatcher<T>): boolean {
  if (property instanceof Date) {
    return (matcher.$in as unknown as Date[])
      .map((x) => x.getTime())
      .includes(property.getTime());
  }
  return matcher.$in.includes(property);
}

function matchesSubWhereMatcher<T>(property: T, matcher: SubWhere<T>): boolean {
  let matches = true;
  for (const propKey in matcher) {
    matches = matches && matchesMatcher(property[propKey], matcher[propKey]);
  }
  return matches;
}

function matchesBetweenMatcher<T>(property: T, matcher: BetweenMatcher<T>): boolean {
  return property >= matcher.$between[0] && property <= matcher.$between[1];
}
