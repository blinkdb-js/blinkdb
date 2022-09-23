import BTree, { DefaultComparable, defaultComparator } from "sorted-btree";
import {
  BetweenMatcher,
  GteMatcher,
  GtMatcher,
  InMatcher,
  LteMatcher,
  LtMatcher,
  Matchers,
} from "../types";

/**
 * Returns the theoretical complexity of a given matcher,
 * e.g. how many items will need to be evaluated approximately.
 */
export function analyzeMatcher<T extends DefaultComparable>(
  btree: BTree<T, unknown>,
  matcher: Matchers<T>
): number {
  if (typeof matcher !== "object" || matcher === null) {
    return 1; // Simple Equals matcher
  } else {
    if ("$equals" in matcher) {
      return 1; // Complex Equals matcher
    } else if ("$in" in matcher) {
      return (matcher as InMatcher<T>).$in.length;
    } else if ("$gt" in matcher) {
      const key = (matcher as GtMatcher<T>).$gt;
      return analyzeGtMatcher(key, btree);
    } else if ("$gte" in matcher) {
      const key = (matcher as GteMatcher<T>).$gte;
      return analyzeGtMatcher(key, btree);
    } else if ("$lt" in matcher) {
      const key = (matcher as LtMatcher<T>).$lt;
      return analyzeLtMatcher(key, btree);
    } else if ("$lte" in matcher) {
      const key = (matcher as LteMatcher<T>).$lte;
      return analyzeLtMatcher(key, btree);
    } else if ("$between" in matcher) {
      const keys = (matcher as BetweenMatcher<T>).$between;
      return analyzeBetweenMatcher(keys[0], keys[1], btree);
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

/**
 * returns the theoretical complexity of a gt/gte matcher.
 */
function analyzeGtMatcher<K extends DefaultComparable>(
  key: K,
  btree: BTree<K, unknown>
): number {
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = rootKeys.length - 1; i >= 0; i--) {
    if (defaultComparator(rootKeys[i], key) >= 0) {
      num++;
    } else {
      break;
    }
  }
  return (Math.floor((num * 10) / rootKeys.length) / 10) * btree.size;
}

/**
 * returns the theoretical complexity of a lt/lte matcher.
 */
function analyzeLtMatcher<K extends DefaultComparable>(
  key: K,
  btree: BTree<K, unknown>
): number {
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = 0; i < rootKeys.length; i++) {
    if (defaultComparator(rootKeys[i], key) <= 0) {
      num++;
    } else {
      break;
    }
  }
  return (Math.floor((num * 10) / rootKeys.length) / 10) * btree.size;
}

/**
 * returns the theoretical complexity of a between matcher.
 */
function analyzeBetweenMatcher<K extends DefaultComparable>(
  min: K,
  max: K,
  btree: BTree<K, unknown>
): number {
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = 0; i < rootKeys.length; i++) {
    const c = defaultComparator;
    const key = rootKeys[i];
    if (c(key, min) >= 0 && c(key, max) <= 0) {
      num++;
    }
    if (c(key, max) >= 0) {
      break;
    }
  }
  return (Math.floor((num * 10) / rootKeys.length) / 10) * btree.size;
}
