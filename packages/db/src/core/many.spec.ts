import { insert } from "./insert";
import { createDB, Database } from "./createDB";
import { many } from "./many";
import { Table, createTable } from "./createTable";

interface User {
  id: number;
  name: string;
  age?: number;
  someIds?: number[];
  some?: {
    nested: {
      object: number;
    };
  };
  date?: Date;
}

let db: Database;
let userTable: Table<User, "id">;

beforeEach(() => {
  db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["age", "date"],
  });
});

it("should return no items if there are no items in the database", async () => {
  const items = await many(userTable);
  expect(items).toHaveLength(0);
});

it("should return all items if called without a filter", async () => {
  const alice: User = { id: 0, name: "Alice" };
  const bob: User = { id: 1, name: "Bob" };
  await insert(userTable, alice);
  await insert(userTable, bob);
  const items = await many(userTable);
  expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
});

describe("filter", () => {
  const alice: User = {
    id: 0,
    name: "Alice",
    age: 5,
    someIds: [1, 2],
    some: { nested: { object: 0 } },
    date: new Date("2000-01-01T00:00:00"),
  };
  const bob: User = {
    id: 1,
    name: "Bob",
    someIds: [3, 1],
    some: { nested: { object: 5 } },
    date: new Date("2000-01-02T00:00:00"),
  };
  const charlie: User = {
    id: 2,
    name: "Charlie",
    age: 10,
    someIds: [4, 2],
    some: { nested: { object: 10 } },
    date: new Date("2000-01-03T00:00:00"),
  };

  beforeEach(async () => {
    await insert(userTable, alice);
    await insert(userTable, bob);
    await insert(userTable, charlie);
  });

  it("should return no items with an empty where filter", async () => {
    const items = await many(userTable, {
      where: {},
    });
    expect(items).toHaveLength(0);
  });

  it("should return items by primary id", async () => {
    const items = await many(userTable, {
      where: {
        id: 0,
      },
    });
    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  it("should return the exact items if db.clone is set to false", async () => {
    db = createDB({
      clone: false,
    });
    userTable = createTable<User>(db, "users")();
    const user: User = { id: 0, name: "Alice" };
    await insert(userTable, user);
    const items = await many(userTable, {
      where: {
        id: 0,
      },
    });

    expect(items[0]).toBe(user);
  });

  it("should return items by primary id and other property", async () => {
    const items = await many(userTable, {
      where: {
        id: 0,
        age: 5,
      },
    });
    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  it("should return items by primary id and other (wrong) property", async () => {
    const items = await many(userTable, {
      where: {
        id: 0,
        age: 4,
      },
    });
    expect(items).toHaveLength(0);
  });

  it("should return items by property using full-table-iteration as fallback", async () => {
    const items = await many(userTable, {
      where: {
        age: 5,
      },
    });

    expect(new Set(items)).toStrictEqual(new Set([alice]));
  });

  describe("matchers", () => {
    describe("strings", () => {
      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            name: "Charlie",
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            name: { $equals: "Charlie" },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $gte: "Bob" },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $gt: "Bob" },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $lte: "Bob" },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $lt: "Bob" },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            name: { $in: ["Alice", "Charlie"] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
      });

      it("should match items with a $between expression", async () => {
        const items = await many(userTable, {
          where: {
            name: { $between: ["Charlie", "Zebra"] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });
    });

    describe("numbers", () => {
      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            id: 0,
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            id: { $equals: 0 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $gte: 1 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $gt: 1 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $lte: 1 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $lt: 1 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            id: { $in: [1, 0] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $between expression", async () => {
        const items = await many(userTable, {
          where: {
            id: { $between: [-1000, 1] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });
    });

    describe("arrays", () => {
      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            someIds: [4, 2],
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $equals: [4, 2] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([{ ...charlie, someIds: [2, 4] }]));
      });

      it("should match items by equality regardless of array item order", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $equals: [2, 4] },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([{ ...charlie, someIds: [2, 4] }]));
      });

      it("should match items with $contains", async () => {
        const items = await many(userTable, {
          where: {
            someIds: { $contains: 2 },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
      });
    });

    describe("objects", () => {
      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: 5,
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $equals: 0,
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $gte: 0,
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $gt: 0,
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $lte: 5,
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $lt: 5,
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with an $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            some: {
              nested: {
                object: {
                  $in: [0, 10],
                },
              },
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
      });
    });

    describe("dates", () => {
      it("should match items by equality (simple)", async () => {
        const items = await many(userTable, {
          where: {
            date: new Date("2000-01-03T00:00:00"),
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items by equality (with $equals)", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $equals: new Date("2000-01-02T00:00:00"),
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob]));
      });

      it("should match items with a $gte comparison", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $gte: new Date("2000-01-02T00:00:00"),
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });

      it("should match items with a $gt comparison", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $gt: new Date("2000-01-02T00:00:00"),
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([charlie]));
      });

      it("should match items with a $lte comparison", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $lte: new Date("2000-01-02T00:00:00"),
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with a $lt comparison", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $lt: new Date("2000-01-02T00:00:00"),
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with an $in comparison", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $in: [new Date("2000-01-03T00:00:00"), new Date("2000-01-01T00:00:00")],
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, charlie]));
      });

      it("should match items with a $between expression", async () => {
        const items = await many(userTable, {
          where: {
            date: {
              $between: [
                new Date("2000-01-02T00:00:00"),
                new Date("2000-01-12T00:00:00"),
              ],
            },
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([bob, charlie]));
      });
    });

    describe("AND", () => {
      it("should match no items with an empty AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: [],
          },
        });

        expect(items).toHaveLength(0);
      });

      it("should match items with an AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: [{ id: 0 }, { age: 5 }],
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match items with an AND filter using full-table-iteration", async () => {
        const items = await many(userTable, {
          where: {
            $and: [{ age: 5 }],
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match no items with an incorrect AND filter", async () => {
        const items = await many(userTable, {
          where: {
            $and: [{ id: 0 }, { age: 7 }],
          },
        });

        expect(items).toStrictEqual([]);
      });
    });

    describe("OR", () => {
      it("should match no items with an empty OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: [],
          },
        });

        expect(items).toHaveLength(0);
      });

      it("should match items with an OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: [{ id: 1 }, { age: 5 }],
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice, bob]));
      });

      it("should match items with an AND filter using full-table-iteration", async () => {
        const items = await many(userTable, {
          where: {
            $or: [{ age: 5 }],
          },
        });

        expect(new Set(items)).toStrictEqual(new Set([alice]));
      });

      it("should match no items with an incorrect OR filter", async () => {
        const items = await many(userTable, {
          where: {
            $or: [{ id: 10 }],
          },
        });

        expect(items).toStrictEqual([]);
      });
    });
  });

  describe("sorting", () => {
    it("should sort items in ascending order", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        sort: {
          key: "age",
          order: "asc",
        },
      });

      expect(items).toStrictEqual([alice, charlie, bob]);
    });

    it("should sort items in descending order", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        sort: {
          key: "age",
          order: "desc",
        },
      });

      expect(items).toStrictEqual([bob, charlie, alice]);
    });
  });

  describe("limit", () => {
    it("should limit items with skip", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          skip: 2,
        },
      });

      expect(items).toStrictEqual([charlie]);
    });

    it("should limit items with take", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          take: 2,
        },
      });

      expect(items).toStrictEqual([alice, bob]);
    });

    it("should limit items with skip & take", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          skip: 1,
          take: 2,
        },
      });

      expect(items).toStrictEqual([bob, charlie]);
    });

    it("should limit items with cursor", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          from: 1,
        },
      });

      expect(items).toStrictEqual([bob, charlie]);
    });

    it("should limit items with cursor & take", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          from: 0,
          take: 2,
        },
      });

      expect(items).toStrictEqual([alice, bob]);
    });

    it("should limit items with cursor, skip & take", async () => {
      const items = await many(userTable, {
        where: {
          id: { $gte: 0 },
        },
        limit: {
          from: 0,
          skip: 1,
          take: 2,
        },
      });

      expect(items).toStrictEqual([bob, charlie]);
    });

    it("should return items with only take specified", async () => {
      const items = await many(userTable, {
        limit: {
          take: 2,
        },
      });

      expect(items).toHaveLength(2);
    });
  });
});
