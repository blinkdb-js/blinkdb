import { User, generateRandomUsers } from "../tests/utils";
import { clear } from "./clear";
import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { first } from "./first";
import { insert } from "./insert";
import { insertMany } from "./insertMany";
import { use } from "./use";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(db, "users")();
  await insertMany(userTable, users);
});

describe("without filter", () => {
  it("should return null if there are no users in table", async () => {
    await clear(userTable);
    const item = await first(userTable);

    expect(item).toBe(null);
  });

  it("should return the first item if there are users", async () => {
    const item = await first(userTable);

    expect(item).toStrictEqual(users[0]);
  });

  it("should clone returned items", async () => {
    const item = await first(userTable);

    expect(item).not.toBe(users[0]);
  });
});

describe("with filter", () => {
  it("should return null if there is no match", async () => {
    const item = await first(userTable, { where: { id: "1337" } });

    expect(item).toBe(null);
  });

  it("should return the item if it finds a match", async () => {
    const item = await first(userTable, { where: { id: "0" } });

    expect(item).toStrictEqual(users.find((u) => u.id === "0"));
  });

  it("should return the first item if there's more than more match", async () => {
    const item = await first(userTable, { where: { id: { gte: "" } } });

    expect(item).toStrictEqual(users[0]);
  });

  it("should clone returned items", async () => {
    const item = await first(userTable, { where: { id: { gte: "" } } });

    expect(item).not.toBe(users[0]);
  });
});

it("should execute first hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => fn(ctx.action));
  await first(userTable);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("first");
});
