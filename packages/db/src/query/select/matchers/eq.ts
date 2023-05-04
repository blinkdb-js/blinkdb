import BTree from "sorted-btree";
import { Ordinal } from "../../../types";
import { compare } from "../../compare";
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
