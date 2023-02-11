import BTree from "sorted-btree";
import { Bench } from "tinybench";

const obj: Record<number, number> = {};
let objIndex = 0;
const map = new Map<number, number>();
let mapIndex = 0;
const btree = new BTree<number, number>();
let btreeIndex = 0;

export const bench = new Bench()
  .add("object", () => {
    obj[objIndex++] = 1;
  })
  .add("map", () => {
    map.set(mapIndex++, 1);
  })
  .add("btree", () => {
    btree.set(btreeIndex++, 1);
  });
