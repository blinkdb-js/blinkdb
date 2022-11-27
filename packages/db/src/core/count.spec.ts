import { analyze } from "../query/analyze";
import { generateRandomUsers, User } from "../tests/utils";
import { count } from "./count";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(db, "users")();
  await insertMany(userTable, users);
});

it("should return the table size if no filter is provided", async () => {
  const size = await count(userTable);

  expect(size).toBe(users.length);
});

it("should return the table size if an empty filter is provided", async () => {
  const size = await count(userTable, {});

  expect(size).toBe(users.length);
});

it("should return the correct count if a filter is provided", async () => {
  const size = await count(userTable, {
    where: {
      name: "Alice",
    },
  });

  expect(size).toBe(users.filter((u) => u.name === "Alice").length);
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

  // "name" isn't an index, so the size will be the table size
  expect(size).toBe(users.length);
});
