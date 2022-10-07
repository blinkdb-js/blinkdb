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
} from "../../types";
import { matchesEqMatcher } from "./eq";
import { matchesGteMatcher } from "./gte";
import { matchesGtMatcher } from "./gt";
import { matchesLteMatcher } from "./lte";
import { matchesLtMatcher } from "./lt";
import { matchesContainsMatcher } from "./contains";
import { matchesInMatcher } from "./in";
import { matchesBetweenMatcher } from "./between";
import { matchesSubWhereMatcher } from "./sub";

/**
 * @returns whether `property` matches `matcher`.
 */
export function matchesMatcher<T, P extends keyof T>(
  property: T[P],
  matcher: Matchers<T[P]>
): boolean {
  if (matcher === null) return false;

  // `any` here prevents TS complaining from generating an union type too complex to represent
  if ((matcher as any) instanceof Date && (property as any) instanceof Date) {
    return matchesEqMatcher(property, matcher as any);
  } else if (typeof matcher === "object") {
    if ("$equals" in matcher) {
      return matchesEqMatcher(property, (matcher as { $equals: T[P] }).$equals);
    } else if ("$gte" in matcher) {
      return matchesGteMatcher(property as any, matcher as GteMatcher<T[P]>);
    } else if ("$gt" in matcher) {
      return matchesGtMatcher(property as any, matcher as GtMatcher<T[P]>);
    } else if ("$lte" in matcher) {
      return matchesLteMatcher(property as any, matcher as LteMatcher<T[P]>);
    } else if ("$lt" in matcher) {
      return matchesLtMatcher(property as any, matcher as LtMatcher<T[P]>);
    } else if ("$contains" in matcher && Array.isArray(property)) {
      return matchesContainsMatcher(property, matcher as ContainsMatcher<T[P]>);
    } else if ("$in" in matcher) {
      return matchesInMatcher(property, matcher as InMatcher<T[P]>);
    } else if ("$between" in matcher) {
      return matchesBetweenMatcher(property as any, matcher as BetweenMatcher<T[P]>);
    } else {
      return matchesSubWhereMatcher(property, matcher as SubWhere<T[P]>);
    }
  } else {
    return matchesEqMatcher(property, matcher as T[P]);
  }
}
