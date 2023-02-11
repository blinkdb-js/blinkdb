import BTree from "sorted-btree";
import { Bench } from "tinybench";

const map = new Map<number, number>();
let mapIndex = 0;
const btree = new BTree<number, number>();
let btreeIndex = 0;

for (let i = 0; i < 100000; i++) {
  map.set(i, i * 100);
  btree.set(i, i * 100);
}

export const bench = new Bench()
  .add("map", () => {
    map.get(mapIndex++);
  })
  .add("btree", () => {
    btree.get(btreeIndex++);
  });
