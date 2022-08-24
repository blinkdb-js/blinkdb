import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { SyncTable, table } from "./table";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: SyncDB;
let userTable: SyncTable<User, "id">;

beforeEach(() => {
    db = createDB();
    userTable = table<User>(db, "users")();
});

it("should return a string representation of the primary key of the inserted item", async () => {
  const aliceId = await create(userTable, { id: 0, name: "Alice", age: 32 });
  expect(aliceId).toBe("0");
});
