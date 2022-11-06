import BTree from "sorted-btree";
import { LteMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForLte<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: LteMatcher<K>,
  cb: SelectCallback<E>
): void {
  const minKey = btree.minKey();
  const maxKey = matcher.lte;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if (ret?.cancel) return { break: 0 };
    });
  }
}
