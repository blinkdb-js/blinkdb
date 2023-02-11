import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insert } from "blinkdb";
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

export const bench = new Bench()
  .add("lokijs", () => {
    lokiUserTable.insertOne(users[lokiIndex++]);
  })
  .add("blinkdb", async () => {
    await insert(blinkUserTable, users[blinkIndex++]);
  });
