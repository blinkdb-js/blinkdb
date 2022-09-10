import BTree, { defaultComparator } from "sorted-btree";
import {
  GteMatcher,
  GtMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
  InMatcher,
  BetweenMatcher,
} from "../types";

/**
 * Select all items for `matcher`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: Matchers<T[P]>
): Promise<T[] | null> {
  if (matcher === null) return null;

  if (typeof matcher === "object" && "$equals" in matcher) {
    return selectEqMatcherItems(btree, (matcher as { $equals: T[P] }).$equals);
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    return selectGteMatcherItems(btree, matcher as GteMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    return selectGtMatcherItems(btree, matcher as GtMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    return selectLteMatcherItems(btree, matcher as LteMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    return selectLtMatcherItems(btree, matcher as LtMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$contains" in matcher) {
    return null;
  } else if (typeof matcher === "object" && "$in" in matcher) {
    return selectInMatcherItems(btree, matcher as InMatcher<T[P]>);
  } else if (typeof matcher === "object" && "$between" in matcher) {
    return selectBetweenMatcherItems(btree, matcher as BetweenMatcher<T[P]>);
  } else if (typeof matcher !== "object") {
    return selectEqMatcherItems(btree, matcher as T[P]);
  }

  return null;
}

async function selectEqMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: T[P]
): Promise<T[]> {
  const item = btree.get(matcher);
  return item ? [item] : [];
}

async function selectGteMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: GteMatcher<T[P]>
): Promise<T[]> {
  const key = matcher.$gte;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    const treeResults = btree.getRange(key, maxKey, true);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectGtMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: GtMatcher<T[P]>
): Promise<T[]> {
  const key = matcher.$gt;
  const maxKey = btree.maxKey();
  if (maxKey !== undefined) {
    let treeResults = btree.getRange(key, maxKey, true);
    if (treeResults[0][0] === key) {
      treeResults = treeResults.slice(1);
    }
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectLteMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: LteMatcher<T[P]>
): Promise<T[]> {
  const key = matcher.$lte;
  const minKey = btree.minKey();
  if (minKey !== undefined) {
    let treeResults = btree.getRange(minKey, key, true);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectLtMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: LtMatcher<T[P]>
): Promise<T[]> {
  const key = matcher.$lt;
  const minKey = btree.minKey();
  if (minKey !== undefined) {
    let treeResults = btree.getRange(minKey, key, false);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectInMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: InMatcher<T[P]>
): Promise<T[]> {
  if (matcher.$in.length === 0) {
    return [];
  }
  if (matcher.$in.length === 1) {
    const key = matcher.$in[0];
    const item = btree.get(key);
    return item ? [item] : [];
  }

  let matcherItems: T[P][];
  if (
    typeof matcher.$in[0] === "number" ||
    typeof matcher.$in[0] === "string" ||
    matcher.$in[0] instanceof Date
  ) {
    matcherItems = (matcher.$in as unknown as (string | number | Date)[]).sort(
      defaultComparator
    ) as unknown as T[P][];
  } else {
    matcherItems = matcher.$in.sort();
  }

  const minKey = matcherItems[0];
  const maxKey = matcherItems[matcherItems.length - 1];
  const items: T[] = [];

  btree.forRange(minKey, maxKey, true, (key, val) => {
    const matchesMinKey =
      key instanceof Date && minKey instanceof Date
        ? key.getTime() === minKey.getTime()
        : key === minKey;
    const matchesMaxKey =
      key instanceof Date && maxKey instanceof Date
        ? key.getTime() === maxKey.getTime()
        : key === maxKey;
    if (matchesMinKey || matchesMaxKey || matcherItems.includes(key)) {
      items.push(val);
    }
  });

  return items;
}

async function selectBetweenMatcherItems<T, P extends keyof T>(
  btree: BTree<T[P], T>,
  matcher: BetweenMatcher<T[P]>
): Promise<T[]> {
  const minKey = matcher.$between[0];
  const maxKey = matcher.$between[1];
  const items: T[] = [];

  btree.forRange(minKey, maxKey, true, (_, val) => {
    items.push(val);
  });

  return items;
}
