import equal from "fast-deep-equal";
import BTree, { defaultComparator } from "sorted-btree";
import { getBiggerKey } from "../../compare";
import { InMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";
import { selectForEq } from "./eq";

export function selectForIn<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: InMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  if (matcher.in.length === 1) {
    return selectForEq(btree, matcher.in[0], cb, from);
  }

  const matcherItems = getSortedMatcherItems(matcher);

  let minKey = matcherItems[0];
  minKey = from ? getBiggerKey(minKey, from) : minKey;
  const maxKey = matcherItems[matcherItems.length - 1];

  btree.editRange(minKey, maxKey, true, (key, val) => {
    if (equal(key, minKey) || equal(key, maxKey) || matcherItems.includes(key)) {
      const ret = cb(val);
      if (ret?.cancel) return { break: 0 };
    }
  });
}

function getSortedMatcherItems<T>(matcher: InMatcher<T>): T[] {
  const items = [...matcher.in];

  if (
    typeof items[0] === "number" ||
    typeof items[0] === "string" ||
    items[0] instanceof Date
  ) {
    (items as (string | number | Date)[]).sort(defaultComparator);
  } else {
    items.sort();
  }

  return items;
}
