import { generateRandomUsers, User } from "../tests/utils";
import { count } from "./count";
import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { isAction, use } from "./use";

let users: User[];
let db: Database;
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["name"],
  });
  await insertMany(userTable, users);
});

describe.each([
  { hookLocation: () => db, name: "db" },
  { hookLocation: () => userTable, name: "table" },
])("$name hooks", ({ hookLocation: obj }) => {
  it("should allow registering hooks", () => {
    const fn = jest.fn();

    use(obj() as any, fn);
  });

  it("should intercept actions", async () => {
    const fn = jest.fn();

    use(obj() as Database, (ctx) => {
      fn(ctx.action);
      return ctx.next(...ctx.params);
    });
    await insert(userTable, { id: "1000", name: "Alice", age: 26 });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("insert");
  });

  it("should deny actions", async () => {
    use(obj() as Database, (ctx) => {
      if (isAction(ctx, "insert")) {
        if (ctx.params[1].name === "Alice") {
          return undefined;
        }
      }
      return ctx.next(...ctx.params);
    });
    const id = await insert(userTable, { id: "1000", name: "Alice", age: 26 });

    expect(id).toBe(undefined);
  });

  it("should modify actions", async () => {
    use(obj() as Database, async (ctx) => {
      if (isAction(ctx, "count")) {
        const value = await ctx.next(...ctx.params);
        return value + 899;
      }
      return ctx.next(...ctx.params);
    });
    const size = await count(userTable);

    expect(size).toBe(999);
  });

  it("should cause actions", async () => {
    use(userTable, async (ctx) => {
      if (isAction(ctx, "insertMany")) {
        const entities = ctx.params[1];
        const uuids: string[] = [];
        for (const entity of entities) {
          uuids.push(await insert(userTable, entity));
        }
        return uuids;
      }
      return ctx.next(...ctx.params);
    });
    const [aliceUuid, bobUuid] = await insertMany(userTable, [
      { id: "1000", name: "Alice" },
      { id: "1001", name: "Bob" },
    ]);
    const alice = await one(userTable, { where: { id: aliceUuid } });
    const bob = await one(userTable, { where: { id: bobUuid } });

    expect(alice.id).toBe("1000");
    expect(bob.id).toBe("1001");
  });
});
