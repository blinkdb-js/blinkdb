import { AllMatchers } from "../../types";
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
export function matches<T>(value: T, matcher: AllMatchers<T>): boolean {
  if (matcher === null) return false;

  // `any` here prevents TS complaining from generating an union type too complex to represent
  if ((matcher as any) instanceof Date && (value as any) instanceof Date) {
    return matchesEq(value as any, matcher as any);
  } else if (typeof matcher === "object") {
    if ("gte" in matcher) {
      return matchesGte(value as any, matcher);
    } else if ("gt" in matcher) {
      return matchesGt(value as any, matcher);
    } else if ("lte" in matcher) {
      return matchesLte(value as any, matcher);
    } else if ("lt" in matcher) {
      return matchesLt(value as any, matcher);
    } else if ("eq" in matcher) {
      return matchesEq(value, matcher.eq);
    } else if ("in" in matcher) {
      return matchesIn(value, matcher);
    } else if ("contains" in matcher) {
      return matchesContains(value as unknown[], matcher);
    } else if ("between" in matcher) {
      return matchesBetween(value as any, matcher);
    } else if ("where" in matcher) {
      return matchesSubWhere(value, matcher);
    }
  }

  return matchesEq(value, matcher as T);
}
