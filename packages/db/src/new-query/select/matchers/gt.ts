import BTree from "sorted-btree";
import { GtMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForGt<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: GtMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  const minKey = matcher.$gt;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    btree.editRange(minKey, maxKey, true, (k, v) => {
      if(k !== minKey) {
        const ret = cb(v);
        if(ret?.cancel) return { break: 0 };
      }
    });
  }
}