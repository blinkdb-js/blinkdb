import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { first } from "./first";
import { insert } from "./insert";
import { many } from "./many";
import { removeMany } from "./removeMany";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(async () => {
  db = createDB();
  userTable = createTable<User>(db, "users")();

  await insert(userTable, { id: 0, name: "Alice", age: 16 });
  await insert(userTable, { id: 1, name: "Bob" });
  await insert(userTable, { id: 2, name: "Charlie", age: 49 });
});

it("should return false if the primary key was not found", async () => {
  const res = await removeMany(userTable, [{ id: 123 }]);
  expect(res).toBe(false);
});

it("should return false if one of the primary keys was not found", async () => {
  const res = await removeMany(userTable, [{ id: 1 }, { id: 2 }, { id: 5 }]);
  expect(res).toBe(false);
});

it("should return true if the primary key was found", async () => {
  const res = await removeMany(userTable, [{ id: 1 }]);
  expect(res).toBe(true);
});

it("should return true if all of the primary keys were found", async () => {
  const res = await removeMany(userTable, [{ id: 1 }, { id: 2 }, { id: 5 }]);
  expect(res).toBe(false);
});

it("should remove an entity", async () => {
  await removeMany(userTable, [{ id: 1 }]);
  const bob = await first(userTable, { where: { id: 1 } });
  expect(bob).toBe(null);
});

it("should remove entities", async () => {
  await removeMany(userTable, [{ id: 0 }, { id: 1 }]);
  const results = await many(userTable, { where: { id: { between: [0, 1] } } });
  expect(results).toStrictEqual([]);
});

it("should correctly remove an entity from a table with index", async () => {
  userTable = createTable<User>(db, "users")({ primary: "id", indexes: ["name"] });

  await insert(userTable, { id: 0, name: "Alice", age: 16 });

  await removeMany(userTable, [{ id: 0 }]);
  const alice = await first(userTable, { where: { id: 0 } });
  expect(alice).toBe(null);
  const alice2 = await first(userTable, { where: { name: "Alice" } });
  expect(alice2).toBe(null);
});
