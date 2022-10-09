import BTree from "sorted-btree";
import { LteMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForLte<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: LteMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  const minKey = btree.minKey();
  const maxKey = matcher.$lte;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if(ret?.cancel) return { break: 0 };
    });
  }
}