import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { upsert } from "./upsert";
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

it("should return the primary key of the item if inserted", async () => {
  const id = await upsert(userTable, users[80]);

  expect(id).toBe(users[80].id);
});

it("should return the primary key of the item if updated", async () => {
  const id = await upsert(userTable, users[20]);

  expect(id).toBe(users[20].id);
});

it("should be able to retrieve the item after inserting", async () => {
  const id = await upsert(userTable, users[80]);
  const user = await one(userTable, { where: { id } });

  expect(user).toStrictEqual(users[80]);
});

it("should be able to retrieve the item after updating", async () => {
  const id = await upsert(userTable, { ...users[20], name: "Charlie the II." });
  const user = await one(userTable, { where: { id } });

  expect(user.name).toBe("Charlie the II.");
});

it("should execute upsert hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await upsert(userTable, users[0]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("upsert");
});
