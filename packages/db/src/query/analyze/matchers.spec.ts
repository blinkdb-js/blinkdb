import BTree from "sorted-btree";
import { analyzeMatcher } from "./matchers";

let btree: BTree<number, number>;
let emptyBtree: BTree<number, number>;

interface User {
  f: number;
}

beforeAll(() => {
  btree = new BTree();
  emptyBtree = new BTree();
  for (let i = 0; i < 1000; i++) {
    btree.set(i, i * 2);
  }
});

it("should analyze simple eq correctly", () => {
  expect(analyzeMatcher(btree, 4)).toBe(1);
  expect(analyzeMatcher(btree, 1)).toBe(1);
  expect(analyzeMatcher(btree, 999)).toBe(1);
});

it("should analyze complex eq correctly", () => {
  expect(analyzeMatcher(btree, { eq: 4 })).toBe(1);
  expect(analyzeMatcher(btree, { eq: 1 })).toBe(1);
  expect(analyzeMatcher(btree, { eq: 999 })).toBe(1);
});

it("should analyze in correctly", () => {
  expect(analyzeMatcher(btree, { in: [] })).toBe(0);
  expect(analyzeMatcher(btree, { in: [4] })).toBe(1);
  expect(analyzeMatcher(btree, { in: [6, 5, 1, 0] })).toBe(4);
});

it("should analyze gt correctly", () => {
  expect(analyzeMatcher(btree, { gt: 900 })).toBe(100);
  expect(analyzeMatcher(btree, { gt: 500 })).toBe(500);
  expect(analyzeMatcher(btree, { gt: 1000 })).toBe(0);
  expect(analyzeMatcher(btree, { gt: -400 })).toBe(1000);
});

it("should analyze gt without any entities correctly", () => {
  expect(analyzeMatcher(emptyBtree, { gt: 900 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gt: 500 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gt: 1000 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gt: -400 })).toBe(0);
});

it("should analyze gte correctly", () => {
  expect(analyzeMatcher(btree, { gte: 900 })).toBe(100);
  expect(analyzeMatcher(btree, { gte: 500 })).toBe(500);
  expect(analyzeMatcher(btree, { gte: 1000 })).toBe(0);
  expect(analyzeMatcher(btree, { gte: -400 })).toBe(1000);
});

it("should analyze gt without any entities correctly", () => {
  expect(analyzeMatcher(emptyBtree, { gte: 900 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gte: 500 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gte: 1000 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { gte: -400 })).toBe(0);
});

it("should analyze lt correctly", () => {
  expect(analyzeMatcher(btree, { lt: 100 })).toBe(100);
  expect(analyzeMatcher(btree, { lt: 300 })).toBe(300);
  expect(analyzeMatcher(btree, { lt: 10000 })).toBe(1000);
  expect(analyzeMatcher(btree, { lt: -100 })).toBe(0);
});

it("should analyze lt without any entities correctly", () => {
  expect(analyzeMatcher(emptyBtree, { lt: 100 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lt: 300 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lt: 10000 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lt: -100 })).toBe(0);
});

it("should analyze lte correctly", () => {
  expect(analyzeMatcher(btree, { lte: 100 })).toBe(100);
  expect(analyzeMatcher(btree, { lte: 300 })).toBe(300);
  expect(analyzeMatcher(btree, { lte: 10000 })).toBe(1000);
  expect(analyzeMatcher(btree, { lte: -100 })).toBe(0);
});

it("should analyze lte without any entities correctly", () => {
  expect(analyzeMatcher(emptyBtree, { lte: 100 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lte: 300 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lte: 10000 })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { lte: -100 })).toBe(0);
});

it("should analyze between correctly", () => {
  expect(analyzeMatcher(btree, { between: [0, 1000] })).toBe(1000);
  expect(analyzeMatcher(btree, { between: [100, 500] })).toBe(400);
  expect(analyzeMatcher(btree, { between: [500, 500] })).toBe(0);
  expect(analyzeMatcher(btree, { between: [-1000, 100] })).toBe(100);
  expect(analyzeMatcher(btree, { between: [700, 100000] })).toBe(300);
});

it("should analyze between without any entities correctly", () => {
  expect(analyzeMatcher(emptyBtree, { between: [0, 1000] })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { between: [100, 500] })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { between: [500, 500] })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { between: [-1000, 100] })).toBe(0);
  expect(analyzeMatcher(emptyBtree, { between: [700, 100000] })).toBe(0);
});
