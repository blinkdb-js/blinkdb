import BTree from "sorted-btree";
import { Bench } from "tinybench";

const obj: Record<number, number> = {};
const map = new Map<number, number>();
const btree = new BTree<number, number>();

for (let i = 0; i < 100000; i++) {
  obj[i] = i * 100;
  map.set(i, i * 100);
  btree.set(i, i * 100);
}

export const bench = new Bench()
  .add("object", () => {
    Object.values(obj);
  })
  .add("map", () => {
    map.values();
  })
  .add("btree", () => {
    btree.values();
  });
