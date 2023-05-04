import BTree from "sorted-btree";
import { LteMatcher, Ordinal } from "../../types";
import { SelectCallback } from "../types";

export function selectForLte<K extends Ordinal, E>(
  btree: BTree<K, E>,
  matcher: LteMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  const minKey = from ?? btree.minKey();
  const maxKey = matcher.lte;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
