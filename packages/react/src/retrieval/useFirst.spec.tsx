import { User } from "../testutils";
import React from "react";
import { clear, createDB, createTable, insert, insertMany, Table, update } from "blinkdb";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useFirst } from "./useFirst";

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
  const { result } = renderHook(() => useFirst(userTable));

  expect(result.current.state).toBe("loading");
  expect(result.current.data).toBe(undefined);
});

test("shows done state on subsequent renders", async () => {
  const { result } = renderHook(() => useFirst(userTable));

  await waitFor(() => {
    expect(result.current.state).toBe("done");
  });
  expect(result.current.data).toStrictEqual(null);
});

describe("without filter", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user", async () => {
    const { result } = renderHook(() => useFirst(userTable));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[0]);
  });

  it("returns undefined if no users in table", async () => {
    await clear(userTable);
    const { result } = renderHook(() => useFirst(userTable));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toBe(null);
  });

  it("updates on changes", async () => {
    const { result } = renderHook(() => useFirst(userTable));

    const newUser: User = { id: "", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.data).toStrictEqual(newUser);
    });
  });

});

describe("with filter", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user matching filter", async () => {
    const { result } = renderHook(() => useFirst(userTable, { where: { name: "Bob" } }));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[1]);
  });

  it("returns undefined if no person matches filter", async () => {
    const { result } = renderHook(() => useFirst(userTable, { where: { name: "Bobby" } }));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toBe(null);
  });

  it("doesn't update on changes not matching the query", async () => {
    const { result } = renderHook(() => useFirst(userTable, { where: { name: "Bob" } }));

    const newUser: User = { id: "", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[1]);
  });

  it("updates on changes matching the query", async () => {
    const { result } = renderHook(() => useFirst(userTable, { where: { name: "Bob" } }));

    const newUser: User = { id: "", name: "Bob" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(newUser);
  });

});

describe("with id", () => {

  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user with the given id", async () => {
    const { result } = renderHook(() => useFirst(userTable, "0"));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual(users[0]);
  });

  it("returns undefined if no person matches id", async () => {
    const { result } = renderHook(() => useFirst(userTable, "999"));

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toBe(null);
  });

  it("updates on changes matching the query", async () => {
    const { result } = renderHook(() => useFirst(userTable, "0"));

    await act(async () => {
      await update(userTable, { ...users[0], name: "Alice the II." });
    });

    await waitFor(() => {
      expect(result.current.state).toBe("done");
    });
    expect(result.current.data).toStrictEqual({ ...users[0], name: "Alice the II." });
  });

});