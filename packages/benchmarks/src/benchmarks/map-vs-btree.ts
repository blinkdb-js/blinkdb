import BTree from "sorted-btree";
import { compare } from "../framework";

(async () => {
  const map = new Map<number, number>();
  const btree = new BTree<number, number>();

  await compare("set", {
    map: () => {
      const x = Math.round(Math.random() * 100);
      const y = Math.round(Math.random() * 100);
      map.set(x, y);
    },
    btree: () => {
      const x = Math.round(Math.random() * 100);
      const y = Math.round(Math.random() * 100);
      btree.set(x, y);
    },
  });

  map.clear();
  btree.clear();
  for (let i = 0; i < 100000; i++) {
    map.set(i, i * 100);
    btree.set(i, i * 100);
  }

  const entries = Array.from(map.entries());
  await compare(
    "init",
    {
      map: () => {
        new Map<number, number>(entries);
      },
      btree: () => {
        new BTree<number, number>(entries);
      },
    },
    { runs: 1000 }
  );

  await compare("get", {
    map: () => {
      const x = Math.round(Math.random() * 100);
      map.get(x);
    },
    btree: () => {
      const x = Math.round(Math.random() * 100);
      btree.get(x);
    },
  });

  await compare(
    "get range",
    {
      map: () => {
        const entries = Array.from(map.entries());
        const result = [];
        for (const entry of entries) {
          if (entry[0] >= 20 && entry[0] < 60) {
            result.push(entry);
          }
        }
      },
      btree: () => {
        btree.getRange(20, 60);
      },
    },
    { runs: 1000 }
  );

  await compare(
    "get all",
    {
      map: () => {
        map.values();
      },
      btree: () => {
        btree.values();
      },
    },
    { runs: 1000 }
  );

  await compare(
    "get all greater than",
    {
      map: () => {
        const mapValues = Array.from(map.values());
        const res = [];
        for (let value of mapValues) {
          if (value > 10) {
            res.push(value);
          }
        }
      },
      btree: () => {
        btree.values(10);
      },
    },
    { runs: 1000 }
  );
})();
