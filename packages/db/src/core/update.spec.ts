import { User, generateRandomUsers } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { update } from "./update";
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

it("should throw if the primary key given to update is not found", async () => {
  expect(update(userTable, { id: "1000" })).rejects.toThrow(
    /Item with primary key .* not found./
  );
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

it("should execute remove hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next();
  });
  await update(userTable, { id: "0", name: "Alice the II.", age: 25 });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("update");
});
