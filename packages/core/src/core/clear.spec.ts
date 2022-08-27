import { clear } from "./clear";
import { create } from "./create";
import { createDB } from "./createDB";
import { many } from "./many";
import { table } from "./table";

interface User {
  id: number;
}

it("should clear the table", async () => {
  const db = createDB();
  const userTable = table<User>(db, "users")();
  await create(userTable, { id: 0 });
  const previousItems = await many(userTable);
  await clear(userTable);
  const nextItems = await many(userTable);

  expect(previousItems).toHaveLength(1);
  expect(nextItems).toHaveLength(0);
});
