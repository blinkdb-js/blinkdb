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
    const mapValues = Array.from(map.values());
    const res = [];
    for (let value of mapValues) {
      if (value >= 10) {
        res.push(value);
      }
    }
  })
  .add("btree", () => {
    btree.values(10);
  });
