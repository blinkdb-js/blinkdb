import BTree from "sorted-btree";
import { getBiggerKey } from "../../compare";
import { BetweenMatcher, OrdProps } from "../../types";
import { SelectCallback } from "../types";

export function selectForBetween<K extends OrdProps, E>(
  btree: BTree<K, E>,
  matcher: BetweenMatcher<K>,
  cb: SelectCallback<E>,
  from?: K
): void {
  let minKey = matcher.between[0];
  minKey = from ? getBiggerKey(minKey, from) : minKey;
  const maxKey = matcher.between[1];

  btree.editRange(minKey, maxKey, true, (_, v) => {
    const ret = cb(v);
    if (ret?.cancel) return { break: 0 };
  });
}
