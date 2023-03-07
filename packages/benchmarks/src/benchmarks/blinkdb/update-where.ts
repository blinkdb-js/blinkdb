import { randFirstName } from "@ngneat/falso";
import { createDB, createTable, insertMany, updateWhere } from "blinkdb";
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
    lokiUserTable.findAndUpdate({ id: users[lokiIndex++].id }, (user) => {
      user.age = (user.age ?? 0) + 1;
    });
  })
  .add("blinkdb", async () => {
    await updateWhere(
      blinkUserTable,
      { where: { id: users[blinkIndex++].id } },
      (user) => {
        return { ...user, age: (user.age ?? 0) + 1 };
      }
    );
  });
