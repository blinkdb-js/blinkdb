import BTree from "sorted-btree";
import { getBiggerKey } from "../../compare";
import { GteMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForGte<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: GteMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  let minKey = matcher.gte;
  minKey = from ? getBiggerKey(minKey, from) : minKey;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
