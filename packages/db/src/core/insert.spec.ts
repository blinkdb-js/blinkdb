import { insert } from "./insert";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, createTable } from "./createTable";

interface User {
  id?: number;
  name: string;
  age?: number;
}

let db: SyncDB;
let userTable: SyncTable<User, "id">;

beforeEach(() => {
  db = createDB();
  userTable = createTable<User>(db, "users")({
    primary: "id"
  });
});

it("should return the primary key of the inserted item", async () => {
  const aliceId = await insert(userTable, { id: 0, name: "Alice", age: 32 });
  expect(aliceId).toBe(0);
});
