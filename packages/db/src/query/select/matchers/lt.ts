import BTree from "sorted-btree";
import { LtMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForLt<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: LtMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  const minKey = from ?? btree.minKey();
  const maxKey = matcher.lt;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, false, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
