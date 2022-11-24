import { insert } from "./insert";
import { createDB, Database } from "./createDB";
import { Table, createTable } from "./createTable";
import { watch } from "./watch";
import { update } from "./update";
import { remove } from "./remove";
import { clear } from "./clear";
import { insertMany } from "./insertMany";
import { updateMany } from "./updateMany";
import { removeMany } from "./removeMany";

interface User {
  id: number;
  name: string;
  age?: number;
}

let db: Database;
let userTable: Table<User, "id">;

const alice: User = { id: 0, name: "Alice", age: 16 };
const bob: User = { id: 1, name: "Bob" };
const charlie: User = { id: 2, name: "Charlie", age: 49 };

beforeEach(async () => {
  db = createDB();
  userTable = createTable<User>(db, "users")();

  await insert(userTable, alice);
  await insert(userTable, bob);
  await insert(userTable, charlie);
});

it("should allow registering a watcher", async () => {
  await watch(userTable, () => {});
});

it("should work with filter", async () => {
  const fn = jest.fn();
  await watch(userTable, { where: { id: { gt: 0 } } }, fn);

  expect(fn.mock.calls[0][0]).toStrictEqual([bob, charlie]);
});

it("should work with sort", async () => {
  const fn = jest.fn();
  await watch(
    userTable,
    { where: { id: { gt: 0 } }, sort: { key: "age", order: "asc" } },
    fn
  );

  expect(fn.mock.calls[0][0]).toStrictEqual([charlie, bob]);
});

it("should work with limit", async () => {
  const fn = jest.fn();
  await watch(userTable, { where: { id: { gt: 0 } }, limit: { take: 1 } }, fn);

  expect(fn.mock.calls[0][0]).toStrictEqual([bob]);
});

describe("without filter", () => {
  it("should call the callback immediately after registering", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toStrictEqual([alice, bob, charlie]);
  });

  it("should call the callback when an entity is inserted", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    const eve: User = { id: 3, name: "Eve", age: 5 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([alice, bob, charlie, eve]);
  });

  it("should call the callback when entities are inserted", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    const eve: User = { id: 3, name: "Eve", age: 5 };
    const frank: User = { id: 4, name: "Frank", age: 111 };
    await insertMany(userTable, [eve, frank]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([alice, bob, charlie, eve, frank]);
  });

  it("should call the callback when an entity is updated", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    update(userTable, { id: 0, name: "Alice the II." });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([
      { ...alice, name: "Alice the II." },
      bob,
      charlie,
    ]);
  });

  it("should call the callback when entities are updated", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    updateMany(userTable, [
      { id: 0, name: "Alice the II." },
      { id: 1, name: "Bob the II." },
      { id: 2, name: "Charlie the II." },
    ]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([
      { ...alice, name: "Alice the II." },
      { ...bob, name: "Bob the II." },
      { ...charlie, name: "Charlie the II." },
    ]);
  });

  it("should call the callback when an entity is removed", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    remove(userTable, { id: 0 });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([bob, charlie]);
  });

  it("should call the callback when entities is removed", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    removeMany(userTable, [{ id: 0 }, { id: 1 }]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([charlie]);
  });

  it("should call the callback when the table is cleared", async () => {
    const fn = jest.fn();
    await watch(userTable, fn);
    clear(userTable);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([]);
  });
});

describe("with filter", () => {
  it("should call the callback immediately after registering", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toStrictEqual([alice, charlie]);
  });

  it("should call the callback when an entity matching the filter is inserted", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: 3, name: "Eve", age: 6 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([alice, charlie, eve]);
  });

  it("should call the callback when entities are inserted", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: 3, name: "Eve", age: 3 };
    const frank: User = { id: 4, name: "Frank", age: 111 };
    await insertMany(userTable, [eve, frank]);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([alice, charlie, frank]);
  });

  it("should not call the callback when an entity not matching the filter is inserted", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    const eve: User = { id: 3, name: "Eve", age: 3 };
    await insert(userTable, eve);

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when an entity matching the filter is updated (and still matches)", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    update(userTable, { id: 0, name: "Alice the II." });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([
      { ...alice, name: "Alice the II." },
      charlie,
    ]);
  });

  it("should not call the callback when an entity not matching the filter is updated (and still doesn't match)", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    update(userTable, { id: 1, name: "Bob the II." });

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when an entity matching the filter is updated (and now doesn't match)", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    update(userTable, { id: 0, age: 2 });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([charlie]);
  });

  it("should call the callback when an entity not matching the filter is updated (and now matches)", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    update(userTable, { id: 1, age: 11 });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([alice, charlie, { ...bob, age: 11 }]);
  });

  it("should call the callback when an entity matching the filter is removed", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    remove(userTable, { id: 0 });

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([charlie]);
  });

  it("should not call the callback when an entity not matching the filter is removed", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    remove(userTable, { id: 1 });

    expect(fn.mock.calls.length).toBe(1);
  });

  it("should call the callback when the table is cleared", async () => {
    const fn = jest.fn();
    await watch(userTable, { where: { age: { gt: 5 } } }, fn);
    clear(userTable);

    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls[1][0]).toStrictEqual([]);
  });
});
