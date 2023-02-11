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
    const objValues = Object.values(obj);
    const res = [];
    for (let value of objValues) {
      if (value <= 100) {
        res.push(value);
      }
    }
  })
  .add("map", () => {
    const mapValues = Array.from(map.values());
    const res = [];
    for (let value of mapValues) {
      if (value <= 100) {
        res.push(value);
      }
    }
  })
  .add("btree", () => {
    btree.getRange(-Infinity, 100);
  });
