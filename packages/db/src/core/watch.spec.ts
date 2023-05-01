import { generateRandomUsers, sortById, User } from "../tests/utils";
import { clear } from "./clear";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insert } from "./insert";
import { insertMany } from "./insertMany";
import { many } from "./many";
import { remove } from "./remove";
import { removeMany } from "./removeMany";
import { removeWhere } from "./removeWhere";
import { update } from "./update";
import { updateMany } from "./updateMany";
import { updateWhere } from "./updateWhere";
import { watch } from "./watch";

let users: User[];
let userTable: Table<User, "id">;
let fn: jest.Mock<void, [User[]]>;

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

  fn = jest.fn<void, [User[]]>();
});

it("should allow registering a watcher", async () => {
  await watch(userTable, () => {});
});

it("should work with filter", async () => {
  await watch(userTable, { where: { id: { gt: "0" } } }, fn);

  expect(fn.mock.calls[0][0].sort(sortById)).toStrictEqual(
    (await many(userTable, { where: { id: { gt: "0" } } })).sort(sortById)
  );
});

it("should work with sort", async () => {
  await watch(
    userTable,
    { where: { age: { gt: 0 } }, sort: { key: "age", order: "desc" } },
    fn
  );

  expect(fn.mock.calls[0][0]).toStrictEqual(
    await many(userTable, {
      where: { age: { gt: 0 } },
      sort: { key: "age", order: "desc" },
    })
  );
});

it("should work with limit", async () => {
  await watch(userTable, { where: { id: { gt: "0" } }, limit: { take: 4 } }, fn);

  expect(fn.mock.calls[0][0].sort(sortById)).toStrictEqual(
    (await many(userTable, { where: { id: { gt: "0" } }, limit: { take: 4 } })).sort(
      sortById
    )
  );
});

describe("without filter", () => {
  it("should call the callback immediately after registering", async () => {
    await watch(userTable, fn);

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0].sort(sortById)).toStrictEqual(users.sort(sortById));
  });

  it("should call the callback when an entity is inserted", async () => {
    await watch(userTable, fn);
    const eve: User = { id: "300", name: "Eve", age: 5 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      [...users, eve].sort(sortById)
    );
  });

  it("should call the callback when entities are inserted", async () => {
    await watch(userTable, fn);
    const eve: User = { id: "300", name: "Eve", age: 5 };
    const frank: User = { id: "400", name: "Frank", age: 111 };
    await insertMany(userTable, [eve, frank]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      [...users, eve, frank].sort(sortById)
    );
  });

  it("should call the callback when an entity is updated", async () => {
    await watch(userTable, fn);
    await update(userTable, { id: "0", name: "Alice the II." });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .map((u) => (u.id === "0" ? { ...u, name: "Alice the II." } : u))
        .sort(sortById)
    );
  });

  it("should call the callback when an entity is updated", async () => {
    await watch(userTable, fn);
    await updateMany(userTable, [
      { id: "0", name: "Alice the II." },
      { id: "1", name: "Bob the II." },
      { id: "2", name: "Charlie the II." },
    ]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .map((u) => {
          switch (u.id) {
            case "0":
              return { ...u, name: "Alice the II." };
            case "1":
              return { ...u, name: "Bob the II." };
            case "2":
              return { ...u, name: "Charlie the II." };
            default:
              return u;
          }
        })
        .sort(sortById)
    );
  });

  it("should call the callback when entities are updated with updateWhere", async () => {
    await watch(userTable, fn);
    await updateWhere(userTable, { where: { id: { gte: "0" } } }, (user) => {
      return { ...user, name: user.name + " the II." };
    });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .map((u) => {
          return { ...u, name: u.name + " the II." };
        })
        .sort(sortById)
    );
  });

  it("should call the callback when an entity is removed", async () => {
    await watch(userTable, fn);
    remove(userTable, { id: "0" });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users.filter((u) => u.id !== "0").sort(sortById)
    );
  });

  it("should call the callback when entities are removed", async () => {
    await watch(userTable, fn);
    removeMany(userTable, [{ id: "0" }, { id: "1" }]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users.filter((u) => u.id !== "0" && u.id !== "1").sort(sortById)
    );
  });

  it("should call the callback when entities are removed with removeWhere", async () => {
    await watch(userTable, fn);
    await removeWhere(userTable, { where: { OR: [{ id: "0" }, { id: "2" }] } });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users.filter((u) => u.id !== "0" && u.id !== "2").sort(sortById)
    );
  });

  it("should call the callback when the table is cleared", async () => {
    await watch(userTable, fn);
    clear(userTable);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([]);
  });
});

describe("with filter", () => {
  it("should call the callback immediately after registering", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0].sort(sortById)).toStrictEqual(
      users.filter((u) => u.age && u.age > 5).sort(sortById)
    );
  });

  it("should call the callback when an entity matching the filter is inserted", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: "300", name: "Eve", age: 10 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      [...users, eve].filter((u) => u.age && u.age > 5).sort(sortById)
    );
  });

  it("should not call the callback when an entity not matching the filter is inserted", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: "300", name: "Eve", age: 5 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when entities are inserted and at least one matches the filter", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: "300", name: "Eve", age: 5 };
    const frank: User = { id: "400", name: "Frank", age: 111 };
    await insertMany(userTable, [eve, frank]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      [...users.filter((u) => u.age && u.age > 5), frank].sort(sortById)
    );
  });

  it("should not call the callback when entities are inserted and none matches the filter", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: "300", name: "Eve", age: 5 };
    const frank: User = { id: "400", name: "Frank", age: 4 };
    await insertMany(userTable, [eve, frank]);

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when an entity matching the filter is updated (and still matches)", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await updateWhere(userTable, { where: { age: { gt: 5 } } }, (user) => {
      return { ...user, name: user.name + " the II." };
    });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .filter((u) => u.age && u.age > 5)
        .map((u) => ({ ...u, name: u.name + " the II." }))
        .sort(sortById)
    );
  });

  it("should call the callback when an entity not matching the filter is updated (and now matches)", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await updateWhere(userTable, { where: { age: { lte: 5 } } }, (user) => {
      return { ...user, age: 111 };
    });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .map((u) => {
          if (u.age && u.age <= 5) {
            return { ...u, age: 111 };
          }
          return u;
        })
        .filter((u) => u.age)
        .sort(sortById)
    );
  });

  it("should call the callback when an entity matching the filter is updated (and doesnt match anymore)", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await updateWhere(userTable, { where: { age: { between: [80, 100] } } }, (user) => {
      return { ...user, age: 1 };
    });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .filter((u) => u.age && u.age > 5 && !(u.age >= 80 && u.age <= 100))
        .sort(sortById)
    );
  });

  it("should not call the callback when an entity not matching the filter is updated (and still doesnt match)", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await updateWhere(userTable, { where: { age: { between: [0, 4] } } }, (user) => {
      return { ...user, name: "Heyo" };
    });

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when an entity matching the filter is removed", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await removeWhere(userTable, { where: { age: { between: [80, 100] } } });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      users
        .filter((u) => u.age && u.age > 5 && !(u.age >= 80 && u.age <= 100))
        .sort(sortById)
    );
  });

  it("should not call the callback when an entity not matching the filter is removed", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    await removeWhere(userTable, { where: { age: { between: [0, 4] } } });

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when the table is cleared", async () => {
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    clear(userTable);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([]);
  });
});

describe("limit", () => {
  it("should limit.take & limit.skip correctly after new items", async () => {
    await watch(userTable, { limit: { skip: 10, take: 4 } }, fn);
    await insertMany(userTable, [
      { id: "101", name: "Alice" },
      { id: "102", name: "Bob" },
    ]);

    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      (await many(userTable, { limit: { skip: 10, take: 4 } })).sort(sortById)
    );
  });
  it("should limit.from correctly after new items", async () => {
    await watch(userTable, { limit: { from: "80" } }, fn);
    await insertMany(userTable, [
      { id: "01", name: "Alice" },
      { id: "02", name: "Bob" },
    ]);

    expect(fn.mock.calls[1][0].sort(sortById)).toStrictEqual(
      (await many(userTable, { limit: { from: "80" } })).sort(sortById)
    );
  });
});
