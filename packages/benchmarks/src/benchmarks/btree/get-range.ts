import BTree from "sorted-btree";
import { Bench } from "tinybench";

const map = new Map<number, number>();
const btree = new BTree<number, number>();

for (let i = 0; i < 100000; i++) {
  map.set(i, i * 100);
  btree.set(i, i * 100);
}

export const bench = new Bench()
  .add("map", () => {
    const entries = Array.from(map.entries());
    const result = [];
    for (const entry of entries) {
      if (entry[0] >= 10 && entry[0] < 1000) {
        result.push(entry);
      }
    }
  })
  .add("btree", () => {
    btree.getRange(10, 1000);
  });
