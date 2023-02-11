import { generateRandomUsers, User } from "../tests/utils";
import { clear } from "./clear";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
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
});

it("should return the primary key of the inserted item", async () => {
  const aliceId = await insert(userTable, users[0]);

  expect(aliceId).toBe(users[0].id);
});

it("should insert items retrievable by primary key", async () => {
  const aliceId = await insert(userTable, users[0]);
  const user = await one(userTable, { where: { id: aliceId } });

  expect(user).toStrictEqual(users[0]);
});

it("should insert items retrievable by index", async () => {
  const aliceId = await insert(userTable, users[0]);
  const user = await one(userTable, { where: { name: users[0].name } });

  expect(user).toStrictEqual(users[0]);
});

it("should insert items retrievable by property", async () => {
  const aliceId = await insert(userTable, users[0]);
  const user = await one(userTable, { where: { age: users[0].age } });

  expect(user).toStrictEqual(users[0]);
});

it("should prevent duplicate primary keys", async () => {
  const aliceId = await insert(userTable, users[0]);
  const fn = async () => await insert(userTable, users[0]);

  expect(fn).rejects.toThrow(`Primary key ${users[0].id} already in use`);
});

it("should allow inserting with a previousy deleted primary key", async () => {
  const aliceId = await insert(userTable, users[0]);
  await clear(userTable);
  const fn = async () => await insert(userTable, users[0]);

  expect(fn).not.toThrow(`Primary key ${users[0].id} already in use`);
});

it("should execute insert hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await insert(userTable, users[0]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("insert");
});
