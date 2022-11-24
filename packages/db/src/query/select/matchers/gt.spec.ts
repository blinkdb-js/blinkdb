import BTree from "sorted-btree";
import { collect } from "../testutils";
import { selectForGt } from "./gt";

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
  expect(collect<Data>((fn) => selectForGt(new BTree(), { gt: "1" }, fn))).toStrictEqual(
    []
  );
});

it("should return all matching items if found", () => {
  expect(collect<Data>((fn) => selectForGt(btree, { gt: "1" }, fn))).toStrictEqual([
    { a: "World" },
  ]);
});

it("should return nothing if the given key is greater than the biggest existing key", () => {
  expect(collect<Data>((fn) => selectForGt(btree, { gt: "z" }, fn))).toStrictEqual([]);
});

it("should return everything if the given key is lesser than the smallest existing key", () => {
  expect(collect<Data>((fn) => selectForGt(btree, { gt: "" }, fn))).toStrictEqual(
    btree.valuesArray()
  );
});
