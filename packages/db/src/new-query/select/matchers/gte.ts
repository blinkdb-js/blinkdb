import BTree from "sorted-btree";
import { GteMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForGte<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: GteMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  const minKey = matcher.$gte;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (_, v) => {
      const ret = cb(v);
      if(ret?.cancel) return { break: 0 };
    });
  }
}