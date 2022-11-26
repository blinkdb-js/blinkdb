import { count } from "./count";
import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";

interface User {
  id: number;
  name: string;
  age: number;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["name"],
  });
  const users: User[] = [];
  for (let i = 0; i < 100; i++) {
    users.push({
      id: i,
      name: ["Alice", "Bob", "Charlie"][i % 3],
      age: i,
    });
  }
  await insertMany(userTable, users);
});

it("should return the table size if no filter is provided", async () => {
  const size = await count(userTable);

  expect(size).toBe(100);
});

it("should return the table size if an empty filter is provided", async () => {
  const size = await count(userTable, {});

  expect(size).toBe(100);
});

it("should return the correct count if a filter is provided", async () => {
  const size = await count(userTable, {
    where: {
      name: "Alice",
    },
  });

  expect(size).toBe(34);
});

it("should return an estimated count if a filter is provided", async () => {
  const size = await count(
    userTable,
    {
      where: {
        name: "Alice",
      },
    },
    { exact: false }
  );

  expect(size).toBe(1);
});
