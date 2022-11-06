import BTree from "sorted-btree";
import { GtMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForGt<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: GtMatcher<K>,
  cb: SelectCallback<E>
): void {
  const minKey = matcher.gt;
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
