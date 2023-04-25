import BTree from "sorted-btree";
import { compare } from "../../compare";
import { OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForEq<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: K,
  cb: SelectCallback<E>,
  from?: K
): void {
  if (from && compare(matcher, from) < 0) return;
  const item = btree.get(matcher);
  if (item) cb(item);
}
