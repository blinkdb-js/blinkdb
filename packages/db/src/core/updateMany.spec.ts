import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { one } from "./one";
import { updateMany } from "./updateMany";

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

  await insert(userTable, { id: 0, name: "Alice", age: 16 });
  await insert(userTable, { id: 1, name: "Bob" });
  await insert(userTable, { id: 2, name: "Charlie", age: 49 });
});

it("should throw if the primary key given to update is not found", async () => {
  expect(updateMany(userTable, [{ id: 3 }])).rejects.toThrow(
    /Item with primary key .* not found./
  );
});

it("should update the entity if the primary key is found", async () => {
  await updateMany(userTable, [{ id: 2, name: "Charlie the II." }]);
  const charlie = await one(userTable, { where: { id: 2 } });
  expect(charlie).toStrictEqual({
    id: 2,
    name: "Charlie the II.",
    age: 49,
  });
});

it("should update multiple properties", async () => {
  await updateMany(userTable, [{ id: 0, name: "Alice the II.", age: 25 }]);
  const alice = await one(userTable, { where: { id: 0 } });
  expect(alice).toStrictEqual({
    id: 0,
    name: "Alice the II.",
    age: 25,
  });
});

it("should update multiple entities", async () => {
  await updateMany(userTable, [
    { id: 0, name: "Alice the II." },
    { id: 1, name: "Bob the II." },
    { id: 2, name: "Charlie the II." },
  ]);
  const alice = await one(userTable, { where: { id: 0 } });
  expect(alice).toStrictEqual({
    id: 0,
    name: "Alice the II.",
    age: 16,
  });
  const bob = await one(userTable, { where: { id: 1 } });
  expect(bob).toStrictEqual({
    id: 1,
    name: "Bob the II.",
  });
  const charlie = await one(userTable, { where: { id: 2 } });
  expect(charlie).toStrictEqual({
    id: 2,
    name: "Charlie the II.",
    age: 49,
  });
});

it("should update indexes", async () => {
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["age", "name"],
  });

  await insert(userTable, { id: 0, name: "Alice", age: 16 });
  await updateMany(userTable, [{ id: 0, name: "Alice the II.", age: 25 }]);
  const alice = await one(userTable, { where: { name: "Alice the II.", age: 25 } });
  expect(alice).toStrictEqual({
    id: 0,
    name: "Alice the II.",
    age: 25,
  });
});
