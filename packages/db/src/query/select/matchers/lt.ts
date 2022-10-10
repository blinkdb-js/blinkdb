import BTree from "sorted-btree";
import { LtMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForLt<K, E>(
  btree: BTree<K, E>,
  matcher: LtMatcher<K>,
  cb: SelectCallback<E>
): void {
  const minKey = btree.minKey();
  const maxKey = matcher.$lt;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, false, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
