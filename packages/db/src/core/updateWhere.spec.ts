import { User, generateRandomUsers, sortById } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { many } from "./many";
import { one } from "./one";
import { updateWhere } from "./updateWhere";
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

it("should throw if the primary key is modified inside the callback", async () => {
  expect(
    updateWhere(userTable, { where: { age: { gt: 0 } } }, (item) => {
      return { ...item, id: "1" };
    })
  ).rejects.toThrow("Primary key cannot be modified in update queries.");
});

it("should update no items if no items match", async () => {
  const fn = jest.fn();
  await updateWhere(userTable, { where: { age: 1000 } }, fn);

  expect(fn.mock.calls.length).toBe(0);
});

it("should update items", async () => {
  await updateWhere(userTable, { where: { age: { gte: 0 } } }, (item) => {
    return { ...item, age: item.age ? item.age + 1 : item.age };
  });
  const oldUsers = users.filter((u) => u.age && u.age > 0);
  const newUsers = await many(userTable, { where: { age: { gte: 0 } } });

  expect(
    newUsers
      .map((item) => ({ ...item, age: item.age ? item.age - 1 : item.age }))
      .sort(sortById)
  ).toStrictEqual(oldUsers.sort(sortById));
});

it("should not update items that dont match the filter", async () => {
  const age = users.find((u) => !!u.age)!.age!;
  await updateWhere(userTable, { where: { age: age } }, (item) => {
    return { ...item, name: "None" };
  });
  const newUsers = await many(userTable, {
    where: { OR: [{ age: { lt: age } }, { age: { gt: age } }] },
  });

  expect(newUsers.map((u) => u.name)).not.toContain("None");
});

it("should execute updateWhere hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next();
  });
  await updateWhere(userTable, { where: { age: { gte: 0 } } }, (item) => {
    return { ...item, age: item.age ? item.age + 1 : item.age };
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("updateWhere");
});
