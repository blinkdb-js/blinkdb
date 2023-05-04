import BTree from "sorted-btree";
import { compare } from "../../compare";
import { Ordinal } from "../../types";
import { SelectCallback } from "../types";

export function selectForEq<K extends Ordinal, E>(
  btree: BTree<K, E>,
  matcher: K,
  cb: SelectCallback<E>,
  from?: K
): void {
  if (from && compare(matcher, from) < 0) return;
  const item = btree.get(matcher);
  if (item) cb(item);
}
