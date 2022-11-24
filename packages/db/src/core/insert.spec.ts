import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { one } from "./one";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(() => {
  db = createDB();
  userTable = createTable<User>(db, "users")();
});

it("should return the primary key of the inserted item", async () => {
  const aliceId = await insert(userTable, { id: 0, name: "Alice", age: 32 });
  expect(aliceId).toBe(0);
});

it("should insert the exact item if db.clone is set to false", async () => {
  db = createDB({
    clone: false,
  });
  userTable = createTable<User>(db, "users")();
  const user: User = { id: 0, name: "Alice" };
  await insert(userTable, user);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).toBe(user);
});

it("should clone the inserted item if db.clone is set to false", async () => {
  const user: User = { id: 0, name: "Alice" };
  await insert(userTable, user);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).not.toBe(user);
  expect(item).toStrictEqual(user);
});
