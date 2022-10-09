import BTree from "sorted-btree";
import { BetweenMatcher } from "../../types";
import { SelectCallback } from "../types";

export function selectForBetween<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: BetweenMatcher<T[P]>,
  cb: SelectCallback<T>
): void {
  const minKey = matcher.$between[0];
  const maxKey = matcher.$between[1];

  btree.editRange(minKey, maxKey, true, (_, v) => {
    const ret = cb(v);
    if(ret?.cancel) return { break: 0 };
  });
}