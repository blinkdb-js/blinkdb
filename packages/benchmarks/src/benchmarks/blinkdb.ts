import { randFirstName } from "@ngneat/falso";
import {
  clear,
  createDB,
  createTable,
  first,
  insert,
  many,
  remove,
  update,
} from "blinkdb";
import { compare } from "../framework";

interface User {
  id: number;
  name: string;
  age?: number;
}

(async () => {
  // BlinkDB setup
  const blinkdb = createDB();
  const blinkUserTable = createTable<User>(blinkdb, "users")();
  const blinkUserTableWithIndex = createTable<User>(
    blinkdb,
    "usersWithIndex"
  )({ primary: "id", indexes: ["name"] });

  // Prefill users
  let users: User[] = [];
  for (let i = 0; i < 10000; i++) {
    users.push({
      id: i,
      name: randFirstName(),
      age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
    });
  }

  await compare(
    "creating 10.000 items",
    {
      "blinkdb with index": async () => {
        for (let user of users) {
          await insert(blinkUserTableWithIndex, user);
        }
      },
      "blinkdb with no index": async () => {
        for (let user of users) {
          await insert(blinkUserTable, user);
        }
      },
    },
    {
      runs: 100,
      beforeEach: () => {
        clear(blinkUserTable);
        clear(blinkUserTableWithIndex);
      },
    }
  );

  await compare("updating one item", {
    "blinkdb with index": async () => {
      const x = await update(blinkUserTableWithIndex, {
        id: 2,
        age: 13,
        name: randFirstName(),
      });
    },
    "blinkdb with no index": async () => {
      const x = await update(blinkUserTable, { id: 2, age: 13, name: randFirstName() });
    },
  });

  await compare(
    "removing one item",
    {
      "blinkdb with index": async () => {
        const x = await remove(blinkUserTableWithIndex, { id: 2 });
      },
      "blinkdb with no index": async () => {
        const x = await remove(blinkUserTable, { id: 2 });
      },
    },
    {
      beforeEach: async () => {
        if ((await first(blinkUserTable, { where: { id: 2 } })) == null) {
          await insert(blinkUserTableWithIndex, users[2]);
          await insert(blinkUserTable, users[2]);
        }
      },
    }
  );

  await compare("many query with limit", {
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        limit: {
          skip: 5000,
          take: 50,
        },
      });
    },
  });
})();
