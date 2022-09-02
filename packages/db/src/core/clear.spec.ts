import { clear } from "./clear";
import { insert } from "./insert";
import { createDB } from "./createDB";
import { many } from "./many";
import { createTable } from "./createTable";

interface User {
  id: number;
}

it("should clear the table", async () => {
  const db = createDB();
  const userTable = createTable<User>(db, "users")();
  await insert(userTable, { id: 0 });
  const previousItems = await many(userTable);
  await clear(userTable);
  const nextItems = await many(userTable);

  expect(previousItems).toHaveLength(1);
  expect(nextItems).toHaveLength(0);
});
