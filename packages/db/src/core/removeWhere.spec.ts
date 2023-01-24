import { User, generateRandomUsers, sortById } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { many } from "./many";
import { removeWhere } from "./removeWhere";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["name"],
  });
  await insertMany(userTable, users);
});

it("should remove no items if no items match", async () => {
  await removeWhere(userTable, { where: { age: 1024 } });
  const receivedUsers = await many(userTable);

  expect(receivedUsers.sort(sortById)).toStrictEqual(users.sort(sortById));
});

it("should remove items", async () => {
  await removeWhere(userTable, { where: { name: "Alice" } });
  const receivedUsers = await many(userTable);

  expect(receivedUsers.sort(sortById)).toStrictEqual(
    users.filter((u) => u.name !== "Alice").sort(sortById)
  );
});
