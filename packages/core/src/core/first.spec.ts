import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, table } from "./table";
import { first } from "./first";

interface User {
  id: number;
}

let db: SyncDB;
let userTable: SyncTable<User, "id">;

beforeEach(() => {
  db = createDB();
  userTable = table<User>(db, "users")();
});

it("should return null if there are no users in table", async () => {
  const item = await first(userTable);

  expect(item).toBe(null);
});

it("should return the item if it finds a match", async () => {
  const user = { id: 0 };
  await create(userTable, user);
  const item = await first(userTable, { where: { id: 0 } });

  expect(item).toBe(user);
});

it("should return the first item if there's more than more match", async () => {
  const user1 = { id: 0 };
  const user2 = { id: 1 };
  await create(userTable, user1);
  await create(userTable, user2);
  const item = await first(userTable, { where: { id: { $gte: 0 } } });

  expect(item).toBe(user1);
});

it("should return null if no item was found", async () => {
  const user = { id: 5 };
  await create(userTable, user);
  const item = await first(userTable, { where: { id: 0 } });

  expect(item).toBe(null);
});
