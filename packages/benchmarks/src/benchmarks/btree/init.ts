import BTree from "sorted-btree";
import { Bench } from "tinybench";

const values: [number, number][] = Array(1000).fill(0).map((_, i) => [i, i]);

export const bench = new Bench()
  .add("object", () => {
    const obj: Record<number, number> = {};
    for(const value of values) {
      obj[value[0]] = value[1];
    }
  })
  .add("map", () => {
    new Map(values);
  })
  .add("btree", () => {
    new BTree(values);
  });
