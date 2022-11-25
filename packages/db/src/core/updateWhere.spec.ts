import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { updateWhere } from "./updateWhere";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = createTable<User>(db, "users")();

  await insertMany(userTable, [
    { id: 0, name: "Alice", age: 16 },
    { id: 1, name: "Bob" },
    { id: 2, name: "Charlie", age: 49 },
  ]);
});

it("should throw if the primary key is modified inside the callback", async () => {
  const fn = async () =>
    await updateWhere(userTable, { where: { age: 16 } }, (item) => {
      return { ...item, id: 1 };
    });

  expect(fn).rejects.toThrow("Primary key cannot be modified in update queries.");
});

it("should update no items if no items match", async () => {
  const fn = jest.fn();
  await updateWhere(userTable, { where: { age: 1 } }, fn);

  expect(fn.mock.calls.length).toBe(0);
});

it("should update items", async () => {
  await updateWhere(userTable, { where: { age: { gte: 0 } } }, (item) => {
    return { ...item, age: item.age ? item.age + 1 : item.age };
  });

  expect((await one(userTable, { where: { id: 0 } })).age).toBe(17);
  expect((await one(userTable, { where: { id: 1 } })).age).toBe(undefined);
  expect((await one(userTable, { where: { id: 2 } })).age).toBe(50);
});

it("should not update items that dont match the filter", async () => {
  await updateWhere(userTable, { where: { age: 16 } }, (item) => {
    return { ...item, age: item.age ? item.age + 1 : item.age };
  });

  expect((await one(userTable, { where: { id: 0 } })).age).toBe(17);
  expect((await one(userTable, { where: { id: 1 } })).age).toBe(undefined);
  expect((await one(userTable, { where: { id: 2 } })).age).toBe(49);
});
