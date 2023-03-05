import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { use } from "./use";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(db, "users")();
  await insertMany(userTable, users);
});

it("should throw if there is no match", async () => {
  const fn = async () => await one(userTable, { where: { id: "1337" } });

  expect(fn).rejects.toThrow("No items found for the given query.");
});

it("should throw if there's more than more match", async () => {
  const fn = async () => await one(userTable, { where: { id: { gte: "" } } });

  expect(fn).rejects.toThrow("More than one item found for the given query.");
});

it("should return the item if it finds a match", async () => {
  const item = await one(userTable, { where: { id: "0" } });

  expect(item).toStrictEqual(users.find((u) => u.id === "0"));
});

it("should clone returned items", async () => {
  const item = await one(userTable, { where: { id: "0" } });

  expect(item).not.toBe(users.find((u) => u.id === "0"));
});

it("should execute one hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await one(userTable, { where: { id: "0" } });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("one");
});
