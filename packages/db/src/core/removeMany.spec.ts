import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { first } from "./first";
import { insertMany } from "./insertMany";
import { many } from "./many";
import { one } from "./one";
import { removeMany } from "./removeMany";
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

it("should return the number of deleted entities", async () => {
  const res = await removeMany(userTable, [
    { id: "0" },
    { id: "0" },
    { id: "1" },
    { id: "1337" },
  ]);

  expect(res).toBe(2);
});

it("should remove an entity", async () => {
  await removeMany(userTable, [{ id: "1" }]);
  const bob = await first(userTable, { where: { id: "1" } });

  expect(bob).toBe(null);
});

it("should remove entities", async () => {
  await removeMany(userTable, [{ id: "0" }, { id: "1" }]);
  const results = await many(userTable, { where: { id: { between: ["0", "1"] } } });

  expect(results).toStrictEqual([]);
});

it("should correctly remove an entity from a table with index", async () => {
  const firstUser = await one(userTable, { where: { id: "30" } });

  await removeMany(userTable, [firstUser, { id: "1337" }]);

  const userWithIndex = await first(userTable, { where: { id: firstUser.id } });
  expect(userWithIndex).not.toStrictEqual(firstUser);
  const userWithName = await first(userTable, { where: { name: firstUser.name } });
  expect(userWithName).not.toStrictEqual(firstUser);
});

it("should execute removeMany hooks", async () => {
  const firstUser = await one(userTable, { where: { id: "30" } });
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await removeMany(userTable, [firstUser]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("removeMany");
});
