import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insertMany } from "blinkdb";
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
for (let i = 0; i < 10000; i++) {
  users.push({
    id: i,
    name: randFirstName(),
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  });
}

export const bench = new Bench()
  .add("lokijs", () => {
    // There's no other way to prevent double insertions currently
    // tinybench doesnt have a hook that can clear the db after every run
    // TODO: Put this in a hook as soon as tinybench has a `cycle` hook
    const newUsers = users.map(u => ({ ...u, id: 10000 * lokiIndex + u.id }));
    lokiIndex++;

    lokiUserTable.insert(newUsers);
  })
  .add("blinkdb", async () => {
    // There's no other way to prevent double insertions currently
    // tinybench doesnt have a hook that can clear the db after every run
    // TODO: Put this in a hook as soon as tinybench has a `cycle` hook
    const newUsers = users.map(u => ({ ...u, id: 10000 * blinkIndex + u.id }));
    blinkIndex++;

    await insertMany(blinkUserTable, newUsers);
  });
