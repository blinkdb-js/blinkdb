import { User } from "../testutils";
import React from "react";
import { createDB, createTable, insert, insertMany, Query, Table } from "blinkdb";
import { renderHook, waitFor } from "@testing-library/react";
import { useMany } from "./useMany";

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
  const { result } = renderHook(() => useMany(userTable));

  expect(result.current.state).toBe("loading");
  expect(result.current.data).toBe(undefined);
});

test("shows done state on subsequent renders", async () => {
  const { result } = renderHook(() => useMany(userTable));

  await waitFor(() => {
    expect(result.current.state).toBe("done");
  });
  expect(result.current.data).toStrictEqual([]);
});

test("restarts fetching when the query changes", async () => {
  await insertMany(userTable, users);
  const { result, rerender } = renderHook((props) => useMany(userTable, props.query), {
    initialProps: { query: {} as Query<User, "id"> }
  });

  await waitFor(() => {
    expect(result.current.data).toStrictEqual(users);
  });

  rerender({ query: { where: { id: "1" } } });

  await waitFor(() => {
    expect(result.current.data).toStrictEqual(users.filter(u => u.id === "1"));
  });
});

describe("without filter", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const { result } = renderHook(() => useMany(userTable));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users);
  });

  it("updates on changes", async () => {
    const { result } = renderHook(() => useMany(userTable));

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.data).toStrictEqual([...users, newUser]);
    });
  });

});

describe("with filter", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const { result } = renderHook(() => useMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } }));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users.filter(u => ["Alice", "Bob"].includes(u.name)));
  });

  it("doesn't update on changes not matching the query", async () => {
    const { result } = renderHook(() => useMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } }));

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users.filter(u => ["Alice", "Bob"].includes(u.name)));
  });

  it("updates on changes matching the query", async () => {
    const { result } = renderHook(() => useMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } }));

    const newUser: User = { id: "4", name: "Elise" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual([...users.filter(u => ["Alice", "Bob"].includes(u.name)), newUser]);
  });

});
