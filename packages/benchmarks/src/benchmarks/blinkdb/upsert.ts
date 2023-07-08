import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insertMany, upsert } from "blinkdb";
import loki from "lokijs";
import { Bench } from "tinybench";

interface User {
  id: number;
  name: string;
  age?: number;
}

const blinkdb = createDB({ clone: false });
let blinkUserTable = createTable<User>(blinkdb, "users")();
let blinkIndex = 0;

const lokidb = new loki("users.db");
let lokiUserTable = lokidb.addCollection<User>("users", { unique: ["id"] });
let lokiIndex = 0;

let users: User[] = [];
for (let i = 0; i < 1000000; i++) {
  users.push({
    id: i,
    name: randFirstName(),
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  });
}

lokiUserTable.insert(users.slice(0, 500000));
insertMany(blinkUserTable, users.slice(0, 500000));

export const bench = new Bench()
  .add("lokijs", () => {
    const user = users[lokiIndex++];
    if ((user as any).$loki) {
      lokiUserTable.update(user);
    } else {
      lokiUserTable.insert(user);
    }
  })
  .add("blinkdb", async () => {
    await upsert(blinkUserTable, users[blinkIndex++]);
  });
