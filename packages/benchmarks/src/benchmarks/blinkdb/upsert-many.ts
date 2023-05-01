import { randFirstName } from "@ngneat/falso";
import { clear, createDB, createTable, insertMany, upsertMany } from "blinkdb";
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

lokiUserTable.insert(users.slice(0, 50000));
insertMany(blinkUserTable, users.slice(0, 50000));

export const bench = new Bench()
  .add(
    "lokijs",
    () => {
      const usersToInsert: User[] = [];
      const usersToUpdate: User[] = [];
      for(const user of users) {
        if(lokiUserTable.get((user as any).$loki)) {
          usersToUpdate.push(user);
        } else {
          usersToInsert.push(user);
        }
      }
      lokiUserTable.insert(usersToInsert);
      lokiUserTable.update(usersToUpdate);
    },
    {
      beforeEach: () => lokiUserTable.clear(),
    }
  )
  .add(
    "blinkdb",
    async () => {
      await upsertMany(blinkUserTable, users);
    },
    {
      beforeEach: () => clear(blinkUserTable),
    }
  );
