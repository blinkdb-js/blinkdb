import { randFirstName } from "@ngneat/falso";
import { clear, createDB, createTable, insertMany } from "blinkdb";
import loki from "lokijs";
import { Bench } from "tinybench";

interface User {
  id: number;
  name: string;
  age?: number;
}

const blinkdb = createDB({ clone: false });
let blinkUserTable = createTable<User>(blinkdb, "users")();

const lokidb = new loki("users.db");
let lokiUserTable = lokidb.addCollection<User>("users", { unique: ["id"] });

let users: User[] = [];
for (let i = 0; i < 10000; i++) {
  users.push({
    id: i,
    name: randFirstName(),
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  });
}

export const bench = new Bench()
  .add(
    "lokijs",
    () => {
      lokiUserTable.insert(users);
    },
    {
      beforeEach: () => {
        lokiUserTable.clear();
        // Loki doesn't reset the $loki indexes, so remove them here
        for (const user of users) {
          (user as any)["$loki"] = undefined;
        }
      },
    }
  )
  .add(
    "blinkdb",
    async () => {
      await insertMany(blinkUserTable, users);
    },
    {
      beforeEach: () => clear(blinkUserTable),
    }
  );
