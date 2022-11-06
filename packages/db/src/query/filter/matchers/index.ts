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
import { matchesEq } from "./eq";
import { matchesGte } from "./gte";
import { matchesGt } from "./gt";
import { matchesLte } from "./lte";
import { matchesLt } from "./lt";
import { matchesContains } from "./contains";
import { matchesIn } from "./in";
import { matchesBetween } from "./between";
import { matchesSubWhere } from "./sub";

/**
 * @returns whether `property` matches `matcher`.
 */
export function matches<T>(value: T, matcher: Matchers<T>): boolean {
  if (matcher === null) return false;

  // `any` here prevents TS complaining from generating an union type too complex to represent
  if ((matcher as any) instanceof Date && (value as any) instanceof Date) {
    return matchesEq(value, matcher as any);
  } else if (typeof matcher === "object") {
    if ("eq" in matcher) {
      return matchesEq(value, (matcher as { eq: T }).eq);
    } else if ("gte" in matcher) {
      return matchesGte(value as any, matcher as GteMatcher<T>);
    } else if ("gt" in matcher) {
      return matchesGt(value as any, matcher as GtMatcher<T>);
    } else if ("lte" in matcher) {
      return matchesLte(value as any, matcher as LteMatcher<T>);
    } else if ("lt" in matcher) {
      return matchesLt(value as any, matcher as LtMatcher<T>);
    } else if ("contains" in matcher && Array.isArray(value)) {
      return matchesContains(value, matcher as ContainsMatcher<T>);
    } else if ("in" in matcher) {
      return matchesIn(value, matcher as InMatcher<T>);
    } else if ("between" in matcher) {
      return matchesBetween(value as any, matcher as BetweenMatcher<T>);
    } else {
      return matchesSubWhere(value, matcher as SubWhere<T>);
    }
  } else {
    return matchesEq(value, matcher as T);
  }
}
