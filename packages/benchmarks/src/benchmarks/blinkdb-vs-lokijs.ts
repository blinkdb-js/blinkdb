import { randFirstName } from "@ngneat/falso";
import { clear, createDB, createTable, insertMany, many, one } from "blinkdb";
import loki from "lokijs";
import { compare } from "../framework";

interface User {
  id: number;
  name: string;
  age?: number;
}

(async () => {
  // BlinkDB setup
  const blinkdb = createDB({
    clone: false,
  });
  const blinkUserTable = createTable<User>(blinkdb, "users")();

  // LokiJS setup
  const lokidb = new loki("users.db");
  let lokiUserTable = lokidb.addCollection<User>("users", {
    unique: ["id"],
  });

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
      lokijs: async () => {
        lokiUserTable.insert(users);
      },
      blinkdb: async () => {
        await insertMany(blinkUserTable, users);
      },
    },
    {
      runs: 100,
      beforeEach: () => {
        lokiUserTable.clear();
        clear(blinkUserTable);
        // users needs to be reset because lokijs injects directly into the objects
        for (let user of users) {
          delete (user as any).meta;
          delete (user as any)["$loki"];
        }
      },
    }
  );

  await compare("getting one item", {
    lokijs: async () => {
      const x = lokiUserTable.get(2);
    },
    blinkdb: async () => {
      const x = await one(blinkUserTable, { where: { id: 2 } });
    },
  });

  await compare("getting one item (find)", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: 2 });
    },
    blinkdb: async () => {
      const x = await one(blinkUserTable, { where: { id: 2 } });
    },
  });

  await compare("filter with gt", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $gt: 8000 } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { gt: 8000 } },
      });
    },
  });

  await compare("filter with gte", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $gte: 8000 } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { gte: 8000 } },
      });
    },
  });

  await compare("filter with lte", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $lte: 2000 } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { lte: 2000 } },
      });
    },
  });

  await compare("filter with lt", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $lt: 2000 } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { lt: 2000 } },
      });
    },
  });

  await compare("complicated filter", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $and: [{ id: { $gt: 1000 } }, { age: { $gt: 5 } }],
      });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { AND: [{ id: { gt: 1000 } }, { age: { gt: 5 } }] },
      });
    },
  });

  await compare("AND", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $and: [{ id: { $lte: 10 } }, { age: { $lt: 5 } }],
      });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { AND: [{ id: { lte: 10 } }, { age: { lt: 5 } }] },
      });
    },
  });

  await compare("OR", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $or: [{ id: 10 }, { id: 50 }],
      });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { OR: [{ id: 10 }, { id: 50 }] },
      });
    },
  });

  await compare("filter with in", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $in: [10, 50, 100] } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { in: [10, 50, 100] } },
      });
    },
  });

  await compare("filter with between", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $between: [90, 100] } });
    },
    blinkdb: async () => {
      const x = await many(blinkUserTable, {
        where: { id: { between: [90, 100] } },
      });
    },
  });
})();
