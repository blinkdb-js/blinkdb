import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { update } from "./update";
import { use } from "./use";
import { ItemNotFoundError } from "./errors";

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

it("should return the primary key of the updated item", async () => {
  const aliceId = await update(userTable, users[0]);

  expect(aliceId).toBe(users[0].id);
});

it("should throw if the primary key given to update is not found", async () => {
  await expect(update(userTable, { id: "1000" })).rejects.toThrow(ItemNotFoundError);
});

it("should update the entity if the primary key is found", async () => {
  await update(userTable, { id: "2", name: "Charlie the II." });
  const charlie = await one(userTable, { where: { id: "2" } });

  expect(charlie.name).toBe("Charlie the II.");
});

it("should update multiple properties", async () => {
  await update(userTable, { id: "2", name: "Charlie the II.", age: 25 });
  const charlie = await one(userTable, { where: { id: "2" } });

  expect(charlie.name).toBe("Charlie the II.");
  expect(charlie.age).toBe(25);
});

it("should update indexes", async () => {
  await update(userTable, { id: "0", name: "Alice the II.", age: 25 });
  const alice = await one(userTable, { where: { name: "Alice the II.", age: 25 } });

  expect(alice).toStrictEqual({
    id: "0",
    name: "Alice the II.",
    age: 25,
  });
});

it("should execute update hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await update(userTable, { id: "0", name: "Alice the II.", age: 25 });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("update");
});
