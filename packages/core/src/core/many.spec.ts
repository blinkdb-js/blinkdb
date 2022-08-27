import { create } from "./create";
import { createDB, SyncDB } from "./createDB";
import { many } from "./many";
import { SyncTable, table } from "./table";

interface User {
  id: number;
  name: string;
  age?: number;
  someIds?: number[];
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

  const alice: User = { id: 0, name: "Alice", age: 5, someIds: [1, 2] };
  const bob: User = { id: 1, name: "Bob", someIds: [3, 1] };
  const charlie: User = { id: 2, name: "Charlie", age: 10, someIds: [4, 2] };

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

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $gte: "Bob" }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $gt: "Bob" }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $lte: "Bob" }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $lt: "Bob" }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $in: ["Alice", "Charlie"] }
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
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

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $gte: 1 }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $gt: 1 }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $lte: 1 }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $lt: 1 }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $in: [1, 0] }
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

    });

    describe("arrays", () => {

      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            someIds: [4, 2]
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $equals: [4, 2] }
          }
        });
    
        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality regardless of array item order", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $equals: [2, 4] }
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with $contains", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $contains: 2 }
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
      });

    });

    describe("AND", () => {

      it("should match no items with an empty AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: []
          }
        });

        expect(items).toHaveLength(0);
      });

      it("should match items with an AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: [
              { id: 0 },
              { age: 5 }
            ]
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with an AND filter using full-table-iteration", async () => {
        const items = await many(userTable, {
          where: {
            $and: [
              { age: 5 }
            ]
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match no items with an incorrect AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: [
              { id: 0 },
              { age: 7 }
            ]
          }
        });

        expect(items).toStrictEqual([]);
      });

    });

    describe("OR", () => {

      it("should match no items with an empty OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: []
          }
        });

        expect(items).toHaveLength(0);
      });

      it("should match items with an OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: [
              { id: 1 },
              { age: 5 }
            ]
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with an AND filter using full-table-iteration", async () => {
        const items = await many(userTable, {
          where: {
            $or: [
              { age: 5 }
            ]
          }
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match no items with an incorrect OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: [
              { id: 10 }
            ]
          }
        });

        expect(items).toStrictEqual([]);
      });

    });

  });

});
