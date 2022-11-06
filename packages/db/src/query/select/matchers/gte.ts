import BTree from "sorted-btree";
import { GteMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForGte<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: GteMatcher<K>,
  cb: SelectCallback<E>
): void {
  const minKey = matcher.gte;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
