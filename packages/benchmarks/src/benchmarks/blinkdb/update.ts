import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insertMany, update } from "blinkdb";
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
for (let i = 0; i < 100000; i++) {
  users.push({
    id: i,
    name: randFirstName(),
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  });
}

lokiUserTable.insert(users);
insertMany(blinkUserTable, users);

export const bench = new Bench()
  .add("lokijs", () => {
    const newUser = { ...users[lokiIndex], age: (users[lokiIndex].age ?? 0) + 1 };
    lokiUserTable.update(newUser);
    lokiIndex++;
  })
  .add("blinkdb", async () => {
    await update(blinkUserTable, {
      id: users[blinkIndex].id,
      age: (users[blinkIndex].age ?? 0) + 1,
    });
    blinkIndex++;
  });
