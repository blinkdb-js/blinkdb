import BTree from "sorted-btree";
import { selectForLt } from "./lt";
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
  expect(collect<Data>(fn => selectForLt<Data, "a">(new BTree(), { $lt: "1" }, fn))).toStrictEqual([]);
});

it("should return all matching items if found", () => {
  expect(collect<Data>(fn => selectForLt<Data, "a">(btree, { $lt: "1" }, fn))).toStrictEqual([
    { a: "Hello" }
  ]);
});

it("should return everything if the given key is greater than the biggest existing key", () => {
  expect(collect<Data>(fn => selectForLt<Data, "a">(btree, { $lt: "z" }, fn))).toStrictEqual(btree.valuesArray());
});

it("should return nothing if the given key is lesser than the smallest existing key", () => {
  expect(collect<Data>(fn => selectForLt<Data, "a">(btree, { $lt: "" }, fn))).toStrictEqual([]);
});