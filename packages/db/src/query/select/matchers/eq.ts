import BTree from "sorted-btree";
import { SelectCallback } from "../types";

export function selectForEq<K, E>(
  btree: BTree<K, E>,
  matcher: K,
  cb: SelectCallback<E>
): void {
  const item = btree.get(matcher);
  if (item) cb(item);
}
