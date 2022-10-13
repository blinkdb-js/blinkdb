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
export function selectForMatcher<K, E>(
  btree: BTree<K, E>,
  matcher: Matchers<K>,
  cb: SelectCallback<E>
): void {
  if (matcher === null) return;

  if (typeof matcher === "object" && "$equals" in matcher) {
    return selectForEq(btree, (matcher as { $equals: K }).$equals, cb);
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    return selectForGte(btree, matcher as GteMatcher<K>, cb);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    return selectForGt(btree, matcher as GtMatcher<K>, cb);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    return selectForLte(btree, matcher as LteMatcher<K>, cb);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    return selectForLt(btree, matcher as LtMatcher<K>, cb);
  } else if (typeof matcher === "object" && "$contains" in matcher) {
    return;
  } else if (typeof matcher === "object" && "$in" in matcher) {
    return selectForIn(btree, matcher as InMatcher<K>, cb);
  } else if (typeof matcher === "object" && "$between" in matcher) {
    return selectForBetween(btree, matcher as BetweenMatcher<K>, cb);
  } else if (typeof matcher !== "object") {
    return selectForEq(btree, matcher as K, cb);
  }
}
