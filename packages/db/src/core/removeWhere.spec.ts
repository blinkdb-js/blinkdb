import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { many } from "./many";
import { removeWhere } from "./removeWhere";

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

  await insertMany(userTable, [
    { id: 0, name: "Alice", age: 16 },
    { id: 1, name: "Bob" },
    { id: 2, name: "Charlie", age: 49 },
  ]);
});

it("should remove no items if no items match", async () => {
  await removeWhere(userTable, { where: { age: 1 } });

  expect(await many(userTable)).toStrictEqual([
    { id: 0, name: "Alice", age: 16 },
    { id: 1, name: "Bob" },
    { id: 2, name: "Charlie", age: 49 },
  ]);
});

it("should remove items", async () => {
  await removeWhere(userTable, { where: { age: { gt: 0 } } });

  expect(await many(userTable)).toStrictEqual([{ id: 1, name: "Bob" }]);
});
