import BTree from "sorted-btree";
import { selectForIn } from "./in";
import { collect } from "../testutils";

interface Data {
  a: string;
  b?: number;
}

let btree: BTree<string, Data>;

beforeEach(() => {
  btree = new BTree();
  btree.set("0", { a: "Hello" });
  btree.set("1", { a: "There" });
  btree.set("2", { a: "World" });
});

it("should return nothing if the btree is empty", () => {
  expect(
    collect<Data>((fn) => selectForIn(new BTree(), { $in: ["a"] }, fn))
  ).toStrictEqual([]);
});

it("should return nothing if there are no items in $in", () => {
  expect(collect<Data>((fn) => selectForIn(btree, { $in: [] }, fn))).toStrictEqual([]);
});

it("should return one item by key if there is one item in $in", () => {
  expect(collect<Data>((fn) => selectForIn(btree, { $in: ["0"] }, fn))).toStrictEqual([
    { a: "Hello" },
  ]);
  expect(collect<Data>((fn) => selectForIn(btree, { $in: ["1"] }, fn))).toStrictEqual([
    { a: "There" },
  ]);
  expect(collect<Data>((fn) => selectForIn(btree, { $in: ["2"] }, fn))).toStrictEqual([
    { a: "World" },
  ]);
});

it("should return all items by key if there are multiple items in $in", () => {
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["0", "1"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "There" }]);
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["0", "2"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "World" }]);
});

it("should ignore the order of keys in $in", () => {
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["0", "2"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "World" }]);
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["2", "0"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "World" }]);
});

it("should return nothing for unknown keys", () => {
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["0", "2", "3"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "World" }]);
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["a", "b"] }, fn))
  ).toStrictEqual([]);
  expect(
    collect<Data>((fn) => selectForIn(btree, { $in: ["z", "0", "zz", "zzz"] }, fn))
  ).toStrictEqual([{ a: "Hello" }]);
});
