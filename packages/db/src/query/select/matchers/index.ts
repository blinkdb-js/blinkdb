import BTree from "sorted-btree";
import { Ordinal } from "../../../types";
import { AllMatchers } from "../../types";
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
export function selectForMatcher<K extends Ordinal, E>(
  btree: BTree<K, E>,
  matcher: AllMatchers<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  if (matcher === null) return;

  if (typeof matcher === "object") {
    if ("gt" in matcher) {
      return selectForGt(btree, matcher, cb, from);
    } else if ("gte" in matcher) {
      return selectForGte(btree, matcher, cb, from);
    } else if ("lt" in matcher) {
      return selectForLt(btree, matcher, cb, from);
    } else if ("lte" in matcher) {
      return selectForLte(btree, matcher, cb, from);
    } else if ("between" in matcher) {
      return selectForBetween(btree, matcher, cb, from);
    } else if ("eq" in matcher) {
      return selectForEq(btree, matcher.eq, cb, from);
    } else if ("in" in matcher) {
      return selectForIn(btree, matcher, cb, from);
    }
  }

  return selectForEq(btree, matcher, cb, from);
}
