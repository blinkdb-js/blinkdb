import BTree from "sorted-btree";
import { selectForEq } from "./eq";
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
  expect(collect<Data>((fn) => selectForEq(new BTree(), "1", fn))).toStrictEqual([]);
});

it("should return the item if matched by eq", () => {
  expect(collect<Data>((fn) => selectForEq(btree, "0", fn))).toStrictEqual([
    { a: "Hello" },
  ]);
  expect(collect<Data>((fn) => selectForEq(btree, "1", fn))).toStrictEqual([
    { a: "There" },
  ]);
  expect(collect<Data>((fn) => selectForEq(btree, "2", fn))).toStrictEqual([
    { a: "World" },
  ]);
});

it("should return nothing if the key doesnt exist", () => {
  expect(collect<Data>((fn) => selectForEq(btree, "3", fn))).toStrictEqual([]);
  expect(collect<Data>((fn) => selectForEq(btree, "364", fn))).toStrictEqual([]);
});
