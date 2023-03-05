import { generateRandomUsers, sortById, User } from "../tests/utils";
import { clear } from "./clear";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { many } from "./many";
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
  it("should return [] if there are no users in table", async () => {
    await clear(userTable);
    const items = await many(userTable);

    expect(items).toStrictEqual([]);
  });

  it("should return all items if there are users", async () => {
    const items = await many(userTable);

    expect(items.sort(sortById)).toStrictEqual(users.sort(sortById));
  });

  it("should clone returned items", async () => {
    const items = await many(userTable);

    expect(items.sort(sortById)).not.toBe(users.sort(sortById));
  });
});

describe("with filter", () => {
  it("should return [] if no items match", async () => {
    const items = await many(userTable, { where: { id: "1337" } });

    expect(items).toStrictEqual([]);
  });

  it("should return the items if items match", async () => {
    const items = await many(userTable, { where: { id: "0" } });

    expect(items).toStrictEqual(users.filter((u) => u.id === "0"));
  });

  it("should clone returned items", async () => {
    const items = await many(userTable, { where: { id: "0" } });

    expect(items).not.toBe(users.filter((u) => u.id === "0"));
  });
});

it("should execute many hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => {
    fn(ctx.action);
    return ctx.next(...ctx.params);
  });
  await many(userTable);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("many");
});
