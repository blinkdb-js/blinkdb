import { generateRandomUsers, User } from "../tests/utils";
import { clear } from "./clear";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { many } from "./many";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(db, "users")();
  await insertMany(userTable, users);
});

it("should clear the table", async () => {
  await clear(userTable);
  const items = await many(userTable);

  expect(items).toHaveLength(0);
});
