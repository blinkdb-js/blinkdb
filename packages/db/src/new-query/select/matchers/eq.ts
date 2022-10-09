import BTree from "sorted-btree";
import { SelectCallback } from "../types";

export function selectForEq<T, K extends keyof T>(
  btree: BTree<T[K], T>,
  matcher: T[K],
  cb: SelectCallback<T>
): void {
  const item = btree.get(matcher);
  if (item) cb(item);
}