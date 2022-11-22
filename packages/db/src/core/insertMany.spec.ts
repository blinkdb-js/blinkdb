import { insertMany } from "./insertMany";
import { createDB, Database } from "./createDB";
import { Table, createTable } from "./createTable";
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
  const ids = await insertMany(userTable, [{ id: 0, name: "Alice", age: 32 }]);
  expect(ids).toStrictEqual([0]);
});

it("should return the primary key of all inserted items", async () => {
  const ids = await insertMany(userTable, [
    { id: 0, name: "Alice", age: 32 },
    { id: 1, name: "Bob", age: 20 },
  ]);
  expect(ids).toStrictEqual([0, 1]);
});

it("should throw if any of the primary keys is not unique", async () => {
  const fn = async () => {
    const ids = await insertMany(userTable, [
      { id: 0, name: "Alice", age: 32 },
      { id: 0, name: "Bob", age: 20 },
    ]);
  };
  expect(fn).rejects.toThrowError("Primary key 0 already in use");
});

it("should insert the exact item if db.clone is set to false", async () => {
  db = createDB({
    clone: false,
  });
  userTable = createTable<User>(db, "users")();
  const user: User = { id: 0, name: "Alice" };
  await insertMany(userTable, [user]);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).toBe(user);
});

it("should clone the inserted item if db.clone is set to false", async () => {
  const user: User = { id: 0, name: "Alice" };
  await insertMany(userTable, [user]);
  const item = await one(userTable, { where: { id: 0 } });

  expect(item).not.toBe(user);
  expect(item).toStrictEqual(user);
});
