import BTree from "sorted-btree";
import { AllMatchers, OrdProps } from "../../types";
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
export function selectForMatcher<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: AllMatchers<K>,
  cb: SelectCallback<E>
): void {
  if (matcher === null) return;

  if (typeof matcher === "object") {
    if ("gt" in matcher) {
      return selectForGt(btree, matcher, cb);
    } else if ("gte" in matcher) {
      return selectForGte(btree, matcher, cb);
    } else if ("lt" in matcher) {
      return selectForLt(btree, matcher, cb);
    } else if ("lte" in matcher) {
      return selectForLte(btree, matcher, cb);
    } else if ("between" in matcher) {
      return selectForBetween(btree, matcher, cb);
    } else if ("eq" in matcher) {
      return selectForEq(btree, matcher.eq, cb);
    } else if ("in" in matcher) {
      return selectForIn(btree, matcher, cb);
    }
  }

  return selectForEq(btree, matcher as any, cb);
}
