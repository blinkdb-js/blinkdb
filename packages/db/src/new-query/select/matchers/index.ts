import BTree, { defaultComparator } from "sorted-btree";
import {
  GteMatcher,
  GtMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
  InMatcher,
  BetweenMatcher,
} from "../../types";
import { SelectCallback } from "../types";
import { selectForBetween } from "./between";
import { selectForEq } from "./eq";
import { selectForGt } from "./gt";
import { selectForGte } from "./gte";
import { selectForIn } from "./in";
import { selectForLt } from "./lt";
import { selectForLte } from "./lte";

/**
 * Selects all items from `btree` that could possibly match the given `matcher`.
 */
export function selectForMatcher<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: Matchers<T[P]>,
  cb: SelectCallback<T>
): void {
  if (matcher === null) return;

  if (typeof matcher === "object" && "$equals" in matcher) {
    selectForEq(btree, (matcher as { $equals: T[P] }).$equals, cb);
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    selectForGte(btree, matcher as GteMatcher<T[P]>, cb);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    selectForGt(btree, matcher as GtMatcher<T[P]>, cb);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    selectForLte(btree, matcher as LteMatcher<T[P]>, cb);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    selectForLt(btree, matcher as LtMatcher<T[P]>, cb);
  } else if (typeof matcher === "object" && "$contains" in matcher) {
    return;
  } else if (typeof matcher === "object" && "$in" in matcher) {
    selectForIn(btree, matcher as InMatcher<T[P]>, cb);
  } else if (typeof matcher === "object" && "$between" in matcher) {
    selectForBetween(btree, matcher as BetweenMatcher<T[P]>, cb);
  } else if (typeof matcher !== "object") {
    selectForEq(btree, matcher as T[P], cb);
  }
}
