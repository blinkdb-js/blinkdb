import equal from "fast-deep-equal";
import BTree, { defaultComparator } from "sorted-btree";
import { InMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForIn<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: InMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  if (matcher.$in.length === 1) {
    const key = matcher.$in[0];
    const item = btree.get(key);
    if(item) cb(item);
    return;
  }

  const matcherItems = getSortedMatcherItems(matcher);

  const minKey = matcherItems[0];
  const maxKey = matcherItems[matcherItems.length - 1];

  btree.editRange(minKey, maxKey, true, (key, val) => {
    if (equal(key, minKey) || equal(key, maxKey) || matcherItems.includes(key)) {
      const ret = cb(val);
      if(ret?.cancel) return { break: 0 };
    }
  });
}

function getSortedMatcherItems<T>(matcher: InMatcher<T>): T[] {
  const items = [...matcher.$in];

  if (
    typeof items[0] === "number" ||
    typeof items[0] === "string" ||
    items[0] instanceof Date
  ) {
    (items as (string|number|Date)[]).sort(defaultComparator);
  } else {
    items.sort();
  }

  return items;
}