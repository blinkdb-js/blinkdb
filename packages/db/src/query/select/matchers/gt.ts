import BTree from "sorted-btree";
import { getBiggerKey } from "../../compare";
import { GtMatcher, Ordinal } from "../../types";
import { SelectCallback } from "../types";

export function selectForGt<K extends Ordinal, E>(
  btree: BTree<K, E>,
  matcher: GtMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  let minKey = matcher.gt;
  minKey = from ? getBiggerKey(minKey, from) : minKey;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (k, v) => {
      if (k !== minKey) {
        const ret = cb(v);
        if (ret?.cancel) return { break: 0 };
      }
    });
  }
}
