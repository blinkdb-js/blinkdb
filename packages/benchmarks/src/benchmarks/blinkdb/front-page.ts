import { createDB, createTable, insertMany, many } from "blinkdb";
import loki from "lokijs";
import { Bench } from "tinybench";

interface User {
  id: number;
  name: string;
  age?: number;
}

const blinkdb = createDB({ clone: false });
let blinkUserTable = createTable<User>(blinkdb, "users")({
  primary: "id",
  indexes: ["name"]
});

const lokidb = new loki("users.db");
let lokiUserTable = lokidb.addCollection<User>("users", {
  unique: ["id"],
  indices: ["name"]
});

let users: User[] = [];
let userMap: Map<string, User[]> = new Map();

for (let i = 0; i < 10000; i++) {
  const user: User = {
    id: i,
    name: ["Alice", "Bob", "Charlie", "Eve"][i % 4],
    age: Math.random() > 0.2 ? Math.random() * 40 : undefined,
  };
  users.push(user);
  userMap.set(user.name, [...(userMap.get(user.name) ?? []), user]);
}
lokiUserTable.insert(users);
insertMany(blinkUserTable, users);

export const bench = new Bench()
  .add("scan", () => {
    users.filter(u => ["Alice", "Charlie"].includes(u.name) && u.age && u.age > 24);
  })
  .add("map", () => {
    let u: User[] = [];
    for(const name of ["Alice", "Charlie"]) {
      u.push(...(userMap.get(name) ?? []).filter(u => u.age && u.age > 24));
    }
  })
  .add("lokijs", () => {
    lokiUserTable.find({ name: { $in: ["Alice", "Charlie"] }, age: { $gt: 24 } });
  })
  .add("blinkdb", async () => {
    await many(blinkUserTable ,{ where: {
      name: { in: ["Alice", "Charlie"] },
      age: { gt: 24 }
    }});
  });
