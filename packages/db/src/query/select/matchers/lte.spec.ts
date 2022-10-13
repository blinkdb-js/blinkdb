import BTree from "sorted-btree";
import { selectForLte } from "./lte";
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
    collect<Data>((fn) => selectForLte(new BTree(), { $lte: "1" }, fn))
  ).toStrictEqual([]);
});

it("should return all matching items if found", () => {
  expect(collect<Data>((fn) => selectForLte(btree, { $lte: "1" }, fn))).toStrictEqual([
    { a: "Hello" },
    { a: "There" },
  ]);
});

it("should return everything if the given key is greater than the biggest existing key", () => {
  expect(collect<Data>((fn) => selectForLte(btree, { $lte: "z" }, fn))).toStrictEqual(
    btree.valuesArray()
  );
});

it("should return nothing if the given key is lesser than the smallest existing key", () => {
  expect(collect<Data>((fn) => selectForLte(btree, { $lte: "" }, fn))).toStrictEqual([]);
});
