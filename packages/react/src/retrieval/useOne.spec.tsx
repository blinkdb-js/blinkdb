import { User } from "../testutils";
import React from "react";
import {
  createDB,
  createTable,
  insertMany,
  Table,
  update
} from "blinkdb";
import { renderHook, waitFor } from "@testing-library/react";
import { useOne } from "./useOne";

let userTable: Table<User, "id">;

const users: User[] = [
  { id: "0", name: "Alice" },
  { id: "1", name: "Bob" },
  { id: "2", name: "Charlie" }
];

beforeEach(() => {
  const db = createDB();
  userTable = createTable<User>(db, "users")();
});

test("shows loading state on first render", async () => {
  const { result } = renderHook(() => useOne(userTable, "0"));

  expect(result.current.state).toBe("loading");
  expect(result.current.data).toBe(undefined);
});

test("shows done state on subsequent renders", async () => {
  await insertMany(userTable, users);
  const { result } = renderHook(() => useOne(userTable, "0"));

  await waitFor(() => {
    expect(result.current.state).toBe("done");
  });
});

describe("with filter", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user matching filter", async () => {
    const { result } = renderHook(() => useOne(userTable, { where: { name: "Bob" } }));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[1]);
  });

  it("returns error if no user matches filter", async () => {
    const { result } = renderHook(() => useOne(userTable, { where: { name: "Bobby" } }));

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.error?.message).toMatch(/No item found/);
  });

  it("returns error if more than one user matches filter", async () => {
    const { result } = renderHook(() => useOne(userTable, { where: { name: { in: ["Alice", "Bob"] } } }));

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.error?.message).toMatch(/More than one item found/);
  });

  it("doesn't update on changes not matching the query", async () => {
    const { result } = renderHook(() => useOne(userTable, { where: { name: "Bob" } }));

    await update(userTable, { ...users[0], name: "Alice the II." });

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[1]);
  });

  it("updates on changes matching the query", async () => {
    const { result } = renderHook(() => useOne(userTable, { where: { id: "1" } }));

    await update(userTable, { ...users[1], name: "Bob the II." });

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual({ ...users[1], name: "Bob the II." });
  });

});

describe("with id", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns user with the given id", async () => {
    const { result } = renderHook(() => useOne(userTable, "0"));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[0]);
  });

  it("returns error if no user matches id", async () => {
    const { result } = renderHook(() => useOne(userTable, "123"));

    await waitFor(() => {
      expect(result.current.state).toBe("error");
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.error?.message).toMatch(/No item found/);
  });

  it("updates on changes not matching the id", async () => {
    const { result } = renderHook(() => useOne(userTable, "0"));

    await update(userTable, { ...users[1], name: "Bob the II." });

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[0]);
  });

  it("updates on changes matching the id", async () => {
    const { result } = renderHook(() => useOne(userTable, "0"));

    await update(userTable, { ...users[0], name: "Alice the II." });

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual({ ...users[0], name: "Alice the II." });
  });

});