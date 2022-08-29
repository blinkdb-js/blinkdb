import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, table } from "./table";
import { remove } from "./remove";
import { first } from "./first";

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

it("should return false if the primary key was not found", async () => {
  const res = await remove(userTable, { id: 123 });
  expect(res).toBe(false);
});

it("should return true if the primary key was found", async () => {
  const res = await remove(userTable, { id: 1 });
  expect(res).toBe(true);
});

it("should remove an entity", async () => {
  await remove(userTable, { id: 1 });
  const bob = await first(userTable, { where: { id: 1 } });
  expect(bob).toBe(null);
});
