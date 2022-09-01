import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, table } from "./table";
import { update } from "./update";
import { one } from "./one";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: SyncDB;
let userTable: SyncTable<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = table<User>(db, "users")();

  await create(userTable, { id: 0, name: "Alice", age: 16 });
  await create(userTable, { id: 1, name: "Bob" });
  await create(userTable, { id: 2, name: "Charlie", age: 49 });
});

it("should throw if the primary key given to update is not found", async () => {
  expect(update(userTable, { id: 3 })).rejects.toThrow(
    /Item with primary key .* not found./
  );
});

it("should update the entity if the primary key is found", async () => {
  await update(userTable, { id: 2, name: "Charlie the II." });
  const charlie = await one(userTable, { where: { id: 2 } });
  expect(charlie).toStrictEqual({
    id: 2,
    name: "Charlie the II.",
    age: 49,
  });
});

it("should update multiple properties", async () => {
  await update(userTable, { id: 0, name: "Alice the II.", age: 25 });
  const alice = await one(userTable, { where: { id: 0 } });
  expect(alice).toStrictEqual({
    id: 0,
    name: "Alice the II.",
    age: 25,
  });
});
