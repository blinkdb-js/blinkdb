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
export async function selectMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: Matchers<T[keyof T]>
): Promise<T[] | null> {
  if (typeof matcher === "object" && "$equals" in matcher) {
    return selectEqMatcherItems(btree, (matcher as { $equals: T[keyof T] }).$equals);
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    return selectGteMatcherItems(btree, matcher as GteMatcher<unknown>);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    return selectGtMatcherItems(btree, matcher as GtMatcher<unknown>);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    return selectLteMatcherItems(btree, matcher as LteMatcher<unknown>);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    return selectLtMatcherItems(btree, matcher as LtMatcher<unknown>);
  } else if (typeof matcher === "object" && "$contains" in matcher) {
    return null;
  } else if (typeof matcher === "object" && "$in" in matcher) {
    return selectInMatcherItems(btree, matcher as InMatcher<T[keyof T]>);
  } else if (typeof matcher === "object" && "$between" in matcher) {
    return selectBetweenMatcherItems(btree, matcher as BetweenMatcher<T[keyof T]>);
  } else if (typeof matcher !== "object") {
    return selectEqMatcherItems(btree, matcher as T[keyof T]);
  }

  console.error("H");

  return null;
}

async function selectEqMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: T[keyof T]
): Promise<T[]> {
  const key = String(matcher);
  const item = btree.get(key);
  return item ? [item] : [];
}

async function selectGteMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: GteMatcher<unknown>
): Promise<T[]> {
  const key = String(matcher.$gte);
  const maxKey = btree.maxKey();
  if (maxKey) {
    const treeResults = btree.getRange(key, maxKey, true);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectGtMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: GtMatcher<unknown>
): Promise<T[]> {
  const key = String(matcher.$gt);
  const maxKey = btree.maxKey();
  if (maxKey) {
    let treeResults = btree.getRange(key, maxKey, true);
    if (treeResults[0][0] === key) {
      treeResults = treeResults.slice(1);
    }
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectLteMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: LteMatcher<unknown>
): Promise<T[]> {
  const key = String(matcher.$lte);
  const minKey = btree.minKey();
  if (minKey) {
    let treeResults = btree.getRange(minKey, key, true);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectLtMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: LtMatcher<unknown>
): Promise<T[]> {
  const key = String(matcher.$lt);
  const minKey = btree.minKey();
  if (minKey) {
    let treeResults = btree.getRange(minKey, key, false);
    return treeResults.map((r) => r[1]);
  } else {
    return [];
  }
}

async function selectInMatcherItems<T, P extends keyof T>(
  btree: BTree<string, T>,
  matcher: InMatcher<T[P]>
): Promise<T[]> {
  if (matcher.$in.length === 0) {
    return [];
  }
  if (matcher.$in.length === 1) {
    const key = String(matcher.$in[0]);
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

  const stringifiedMatcherItems = matcherItems.map((i) => String(i));
  const minKey = stringifiedMatcherItems[0];
  const maxKey = stringifiedMatcherItems[matcherItems.length - 1];
  const items: T[] = [];

  btree.forRange(minKey, maxKey, true, (key, val) => {
    if (key === minKey || key == maxKey || stringifiedMatcherItems.includes(key)) {
      items.push(val);
    }
  });

  return items;
}

async function selectBetweenMatcherItems<T, P extends keyof T>(
  btree: BTree<string, T>,
  matcher: BetweenMatcher<T[P]>
): Promise<T[]> {
  const minKey = String(matcher.$between[0]);
  const maxKey = String(matcher.$between[1]);
  const items: T[] = [];

  btree.forRange(minKey, maxKey, true, (_, val) => {
    items.push(val);
  });

  return items;
}
