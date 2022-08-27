import BTree from "sorted-btree";
import {
  ComplexEqualsMatcher,
  GteMatcher,
  GtMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
  SimpleEqualsMatcher,
} from "../types";

/**
 * Select all items for `matcher`.
 *
 * @returns the selected items from the database, or `null` in case a full table scan is required.
 */
export async function selectMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: Matchers<T[keyof T]>
): Promise<T[]|null> {
  if (typeof matcher === "object" && "$equals" in matcher) {
    return selectComplexEqMatcherItems(
      btree,
      matcher as ComplexEqualsMatcher<T[keyof T]>
    );
  } else if (typeof matcher === "object" && "$gte" in matcher) {
    return selectGteMatcherItems(btree, matcher as GteMatcher<unknown>);
  } else if (typeof matcher === "object" && "$gt" in matcher) {
    return selectGtMatcherItems(btree, matcher as GtMatcher<unknown>);
  } else if (typeof matcher === "object" && "$lte" in matcher) {
    return selectLteMatcherItems(btree, matcher as LteMatcher<unknown>);
  } else if (typeof matcher === "object" && "$lt" in matcher) {
    return selectLtMatcherItems(btree, matcher as LtMatcher<unknown>);
  } else if (typeof matcher !== "object") {
    return selectSimpleEqMatcherItems(
      btree,
      matcher as SimpleEqualsMatcher<T[keyof T]>
    );
  }

  return null;
}

async function selectComplexEqMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: ComplexEqualsMatcher<T[keyof T]>
): Promise<T[]> {
  const key = String(matcher.$equals);
  const item = btree.get(key);
  return item ? [item] : [];
}

async function selectSimpleEqMatcherItems<T>(
  btree: BTree<string, T>,
  matcher: SimpleEqualsMatcher<T[keyof T]>
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
