import { User, generateRandomUsers } from "../tests/utils";
import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { updateMany } from "./updateMany";
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
  expect(updateMany(userTable, [{ id: "1000" }])).rejects.toThrow(
    /Item with primary key .* not found./
  );
});

it("should update the entity if the primary key is found", async () => {
  await updateMany(userTable, [{ id: "2", name: "Charlie the II." }]);
  const charlie = await one(userTable, { where: { id: "2" } });

  expect(charlie.name).toBe("Charlie the II.");
});

it("should update multiple properties", async () => {
  await updateMany(userTable, [{ id: "2", name: "Charlie the II.", age: 25 }]);
  const charlie = await one(userTable, { where: { id: "2" } });

  expect(charlie.name).toBe("Charlie the II.");
  expect(charlie.age).toBe(25);
});

it("should update multiple entities", async () => {
  await updateMany(userTable, [
    { id: "0", name: "Alice the II." },
    { id: "1", name: "Bob the II." },
    { id: "2", name: "Charlie the II." },
  ]);
  const alice = await one(userTable, { where: { id: "0" } });
  const bob = await one(userTable, { where: { id: "1" } });
  const charlie = await one(userTable, { where: { id: "2" } });

  expect(alice.name).toBe("Alice the II.");
  expect(bob.name).toBe("Bob the II.");
  expect(charlie.name).toBe("Charlie the II.");
});

it("should update indexes", async () => {
  await updateMany(userTable, [{ id: "0", name: "Alice the II.", age: 25 }]);
  const alice = await one(userTable, { where: { name: "Alice the II.", age: 25 } });

  expect(alice).toStrictEqual({
    id: "0",
    name: "Alice the II.",
    age: 25,
  });
});

it("should execute updateMany hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next();
  });
  await updateMany(userTable, [{ id: "0", name: "Alice the II.", age: 25 }]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("updateMany");
});
