import BTree from "sorted-btree";
import { Bench } from "tinybench";

const values: [number, number][] = Array(1000).fill(0).map((_, i) => [i, i]);

export const bench = new Bench()
  .add("map", () => {
    new Map(values);
  })
  .add("btree", () => {
    new BTree(values);
  });
