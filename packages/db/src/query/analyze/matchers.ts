import BTree from "sorted-btree";
import { compare, getBiggerKey } from "../compare";
import { AllMatchers, Ordinal } from "../types";

/**
 * Returns the theoretical complexity of a given matcher,
 * e.g. how many items will need to be evaluated approximately.
 */
export function analyzeMatcher<T extends Ordinal>(
  btree: BTree<T, unknown>,
  matcher: AllMatchers<T>,
  from?: T
): number {
  if (typeof matcher !== "object" || matcher === null) {
    return 1; // Simple Equals matcher
  } else {
    if ("eq" in matcher) {
      return 1; // Complex Equals matcher
    } else if ("in" in matcher) {
      return matcher.in.length;
    } else if ("gt" in matcher) {
      const key = matcher.gt;
      return analyzeGtMatcher(key, btree, from);
    } else if ("gte" in matcher) {
      const key = matcher.gte;
      return analyzeGtMatcher(key, btree, from);
    } else if ("lt" in matcher) {
      const key = matcher.lt;
      return analyzeLtMatcher(key, btree, from);
    } else if ("lte" in matcher) {
      const key = matcher.lte;
      return analyzeLtMatcher(key, btree, from);
    } else if ("between" in matcher) {
      const keys = matcher.between;
      return analyzeBetweenMatcher(keys[0], keys[1], btree, from);
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

/**
 * returns the theoretical complexity of a gt/gte matcher.
 */
function analyzeGtMatcher<K extends Ordinal>(
  key: K,
  btree: BTree<K, unknown>,
  from?: K
): number {
  key = from ? getBiggerKey(key, from) : key;
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = rootKeys.length - 1; i >= 0; i--) {
    if (compare(rootKeys[i], key) >= 0) {
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
function analyzeLtMatcher<K extends Ordinal>(
  key: K,
  btree: BTree<K, unknown>,
  from?: K
): number {
  if (from) return analyzeBetweenMatcher(from, key, btree);
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = 0; i < rootKeys.length; i++) {
    if (compare(rootKeys[i], key) <= 0) {
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
function analyzeBetweenMatcher<K extends Ordinal>(
  min: K,
  max: K,
  btree: BTree<K, unknown>,
  from?: K
): number {
  min = from ? getBiggerKey(min, from) : min;
  let num = 1;
  const rootKeys = btree["_root"].keys as K[];
  if (rootKeys.length === 0) return 0;
  for (let i = 0; i < rootKeys.length; i++) {
    const c = compare;
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
