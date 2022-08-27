import loki from "lokijs";
import { clear, create, createDB, many, table } from "@thunder/core";
import { randFirstName } from "@ngneat/falso";
import { compare } from "../framework";

interface User {
  id: string;
  name: string;
  age?: number;
}

(async () => {
  // ThunderDB setup
  const thunderdb = createDB();
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
      const x = await many(thunderUserTable, { where: { id: "2" } });
    },
  });

  await compare("getting one item (find)", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: "2" });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, { where: { id: "2" } });
    },
  });

  await compare("filter with $gt", {
    lokijs: async () => {
      const x = lokiUserTable.find({ id: { $gt: "100" } });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, { where: { id: { $gt: "100" } } });
    },
  });

  await compare("complicated filter", {
    lokijs: async () => {
      const x = lokiUserTable.find({
        $and: [{ id: { $gt: "100" } }, { age: { $gt: 5 } }],
      });
    },
    thunderdb: async () => {
      const x = await many(thunderUserTable, {
        where: { $and: [{ id: { $gt: "100" } }, { age: { $gt: 5 } }] },
      });
    },
  });
})();
