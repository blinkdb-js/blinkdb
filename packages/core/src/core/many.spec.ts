import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { many } from "./many";
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

it("should return no items if there are no items in the database", async () => {
  const items = await many(userTable);
  expect(items).toHaveLength(0);
});

it("should return all items if called without a filter", async () => {
  const alice: User = { id: 0, name: "Alice" };
  const bob: User = { id: 1, name: "Bob" };
  await create(userTable, alice);
  await create(userTable, bob);
  const items = await many(userTable);
  expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
});

describe("filter", () => {

  const alice: User = { id: 0, name: "Alice", age: 5 };
  const bob: User = { id: 1, name: "Bob" };
  const charlie: User = { id: 2, name: "Charlie", age: 10 };

  beforeEach(async () => {
    await create(userTable, alice);
    await create(userTable, bob);
    await create(userTable, charlie);
  });

  it("should return no items with an empty where filter", async () => {
    const items = await many(userTable, {
      where: {}
    });
    expect(items).toHaveLength(0);
  });

  it("should return items by primary id", async () => {
    const items = await many(userTable, {
      where: {
        id: 0
      }
    });
    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  it("should return items by primary id and other property", async () => {
    const items = await many(userTable, {
      where: {
        id: 0,
        age: 5
      }
    });
    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  it("should return items by primary id and other (wrong) property", async () => {
    const items = await many(userTable, {
      where: {
        id: 0,
        age: 4
      }
    });
    expect(items).toHaveLength(0);
  });

  it("should return items by property using full-table-iteration as fallback", async () => {
    const items = await many(userTable, {
      where: {
        age: 5
      }
    });

    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  describe("matchers", () => {

    describe("strings", () => {

      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            name: "Charlie"
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            name: { $equals: "Charlie" }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

    });

    describe("numbers", () => {

      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            id: 0
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            id: { $equals: 0 }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

    });

  });

});
