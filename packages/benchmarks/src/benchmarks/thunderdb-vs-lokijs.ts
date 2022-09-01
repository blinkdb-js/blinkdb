import loki from "lokijs";
import { clear, create, createDB, many, table, one } from "@thunder/db";
import { randFirstName } from "@ngneat/falso";
import { compare } from "../framework";

interface User {
  id: string;
  name: string;
  age?: number;
}

(async () => {
  // ThunderDB setup
  const thunderdb = createDB({
    clone: false,
  });
  const thunderUserTable = table<User>(thunderdb, "users")();

  // LokiJS setup
  const lokidb = new loki("users.db");
  let lokiUserTable = lokidb.addCollection<User>("users", {
    unique: ["id"],
  });

  // Prefill users
  let users: User[] = [];
  for (let i = 0; i < 10000; i++) {
    users.push({
      id: String(i),
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
      thunderdb: async () => {
        for (let user of users) {
          await create(thunderUserTable, user);
        }
      },
    },
    {
      runs: 100,
      beforeEach: () => {
        lokiUserTable.clear();
        clear(thunderUserTable);
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
    thunderdb: async () => {
      const x = await one(thunderUserTable, { where: { id: "2" } });
    },
  });

  await compare("getting one item (find)", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: "2" });
    },
    thunderdb: async () => {
      const x = await one(thunderUserTable, { where: { id: "2" } });
    },
  });

  await compare("filter with $gt", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $gt: "8000" } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $gt: "8000" } },
      });
    },
  });

  await compare("filter with $gte", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $gte: "8000" } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $gte: "8000" } },
      });
    },
  });

  await compare("filter with $lte", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $lte: "2000" } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $lte: "2000" } },
      });
    },
  });

  await compare("filter with $lt", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $lt: "2000" } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $lt: "2000" } },
      });
    },
  });

  await compare("complicated filter", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $and: [{ id: { $gt: "1000" } }, { age: { $gt: 5 } }],
      });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { $and: [{ id: { $gt: "1000" } }, { age: { $gt: 5 } }] },
      });
    },
  });

  await compare("AND", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $and: [{ id: { $lte: "10" } }, { age: { $lt: 5 } }],
      });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { $and: [{ id: { $lte: "10" } }, { age: { $lt: 5 } }] },
      });
    },
  });

  await compare("OR", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $or: [{ id: "10" }, { id: "50" }],
      });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { $or: [{ id: "10" }, { id: "50" }] },
      });
    },
  });

  await compare("filter with $in", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $in: ["10", "50", "100"] } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $in: ["10", "50", "100"] } },
      });
    },
  });

  await compare("filter with $between", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $between: ["90", "100"] } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { id: { $between: ["90", "100"] } },
      });
    },
  });
})();
