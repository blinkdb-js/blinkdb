import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { first } from "./first";
import { insert } from "./insert";
import { remove } from "./remove";
import { insertMany } from "./insertMany";
import { one } from "./one";
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
  await insertMany(userTable, users);
});

it("should return false if the primary key was not found", async () => {
  const res = await remove(userTable, { id: "1337" });

  expect(res).toBe(false);
});

it("should return true if the primary key was found", async () => {
  const res = await remove(userTable, { id: "1" });

  expect(res).toBe(true);
});

it("should remove an entity", async () => {
  await remove(userTable, { id: "1" });
  const user = await first(userTable, { where: { id: "1" } });

  expect(user).toBe(null);
});

it("should correctly remove an entity from a table with index", async () => {
  const firstUser = await one(userTable, { where: { id: "30" } });

  await remove(userTable, firstUser);

  const userWithIndex = await first(userTable, { where: { id: firstUser.id } });
  expect(userWithIndex).not.toStrictEqual(firstUser);
  const userWithName = await first(userTable, { where: { name: firstUser.name } });
  expect(userWithName).not.toStrictEqual(firstUser);
});

it("should execute remove hooks", async () => {
  const firstUser = await one(userTable, { where: { id: "30" } });
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next();
  });
  await remove(userTable, firstUser);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("remove");
});
