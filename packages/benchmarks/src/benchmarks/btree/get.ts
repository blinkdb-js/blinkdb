import BTree from "sorted-btree";
import { Bench } from "tinybench";

const obj: Record<number, number> = {};
let objIndex = 0;
const map = new Map<number, number>();
let mapIndex = 0;
const btree = new BTree<number, number>();
let btreeIndex = 0;

for (let i = 0; i < 100000; i++) {
  obj[i] = i * 100;
  map.set(i, i * 100);
  btree.set(i, i * 100);
}

export const bench = new Bench()
  .add("object", () => {
    obj[objIndex++];
  })
  .add("map", () => {
    map.get(mapIndex++);
  })
  .add("btree", () => {
    btree.get(btreeIndex++);
  });
