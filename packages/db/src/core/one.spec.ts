import { insert } from "./insert";
import { createDB, Database } from "./createDB";
import { Table, createTable } from "./createTable";
import { one } from "./one";

interface User {
  id: number;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = createTable<User>(db, "users")();

  await insert(userTable, { id: 0 });
  await insert(userTable, { id: 1 });
  await insert(userTable, { id: 2 });
});

it("should throw if no items have been found", async () => {
  expect(one(userTable, { where: { id: 5 } })).rejects.toThrow(/No items found/);
});

it("should throw if more than one item has been found", async () => {
  expect(one(userTable, { where: { id: { $gt: 0 } } })).rejects.toThrow(
    /More than one item found/
  );
});

it("should return the item if found", async () => {
  expect(await one(userTable, { where: { id: 2 } })).toStrictEqual({ id: 2 });
});

it("should return the exact item if db.clone is set to false", async () => {
  db = createDB({
    clone: false,
  });
  userTable = createTable<User>(db, "users")();
  const user = { id: 0 };
  await insert(userTable, user);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).toBe(user);
});
