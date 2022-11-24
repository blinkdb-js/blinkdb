import BTree from "sorted-btree";
import { collect } from "../testutils";
import { selectForBetween } from "./between";

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
    collect<Data>((fn) => selectForBetween(new BTree(), { between: ["0", "1"] }, fn))
  ).toStrictEqual([]);
});

it("should return all matching items if found", () => {
  expect(
    collect<Data>((fn) => selectForBetween(btree, { between: ["0", "1"] }, fn))
  ).toStrictEqual([{ a: "Hello" }, { a: "There" }]);
  expect(
    collect<Data>((fn) => selectForBetween(btree, { between: ["0", "0"] }, fn))
  ).toStrictEqual([{ a: "Hello" }]);
  expect(
    collect<Data>((fn) => selectForBetween(btree, { between: ["1", "2"] }, fn))
  ).toStrictEqual([{ a: "There" }, { a: "World" }]);
});

it("should return nothing if the given range is greater than the biggest existing key", () => {
  expect(
    collect<Data>((fn) => selectForBetween(btree, { between: ["a", "z"] }, fn))
  ).toStrictEqual([]);
});

it("should return nothing if the given range is lesser than the smallest existing key", () => {
  expect(
    collect<Data>((fn) => selectForBetween(btree, { between: ["", "-"] }, fn))
  ).toStrictEqual([]);
});
