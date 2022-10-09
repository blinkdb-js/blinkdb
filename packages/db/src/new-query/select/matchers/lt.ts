import BTree from "sorted-btree";
import { LtMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForLt<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: LtMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  const minKey = btree.minKey();
  const maxKey = matcher.$lt;
  if (minKey !== undefined) {
    btree.editRange(minKey, maxKey, false, (_, v) => {
      const ret = cb(v);
      if(ret?.cancel) return { break: 0 };
    });
  }
}