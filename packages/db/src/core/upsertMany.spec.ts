import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { upsertMany } from "./upsertMany";
import { use } from "./use";

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
  await insertMany(userTable, users.slice(0, 50));
});

it("should return the primary keys of the items inserted", async () => {
  const [id] = await upsertMany(userTable, [users[80]]);

  expect(id).toBe(users[80].id);
});

it("should return the primary keys of the items updated", async () => {
  const [id] = await upsertMany(userTable, [users[20]]);

  expect(id).toBe(users[20].id);
});

it("should return the primary keys of the items inserted & updated", async () => {
  const [id1, id2] = await upsertMany(userTable, [users[20], users[80]]);

  expect(id1).toBe(users[20].id);
  expect(id2).toBe(users[80].id);
});

it("should be able to retrieve the item after inserting/updating", async () => {
  const [id1, id2] = await upsertMany(userTable, [
    { ...users[80], name: "New user" },
    { ...users[20], name: "Existing user" },
  ]);
  const user1 = await one(userTable, { where: { id: id1 } });
  const user2 = await one(userTable, { where: { id: id2 } });

  expect(user1.name).toBe("New user");
  expect(user2.name).toBe("Existing user");
});

it("should execute upsertMany hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await upsertMany(userTable, [users[0]]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("upsertMany");
});
