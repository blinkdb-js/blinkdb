import { waitFor } from "@testing-library/vue";
import { createDB, createTable, insert, insertMany, Table } from "blinkdb";
import { User, withSetup } from "./testutils";
import { watchMany } from "./watchMany";

let userTable: Table<User, "id">;

const users: User[] = [
  { id: "0", name: "Alice" },
  { id: "1", name: "Bob" },
  { id: "2", name: "Charlie" },
];

beforeEach(() => {
  const db = createDB();
  userTable = createTable<User>(db, "users")();
});

test("shows loading state on first render", async () => {
  const [{ state, data }, app] = withSetup(() => watchMany(userTable));

  expect(state.value).toBe("loading");
  expect(data.value).toBe(undefined);

  app.unmount();
});

test("shows done state on subsequent renders", async () => {
  const [{ state, data }, app] = withSetup(() => watchMany(userTable));

  await waitFor(() => {
    expect(state.value).toBe("done");
  });
  expect(data.value).toStrictEqual([]);

  app.unmount();
});

describe("without filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const [{ state, data }, app] = withSetup(() => watchMany(userTable));

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual(users);

    app.unmount();
  });

  it("updates on changes", async () => {
    const [{ state, data }, app] = withSetup(() => watchMany(userTable));

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(data.value).toStrictEqual([...users, newUser]);
    });

    app.unmount();
  });
});

describe("with filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const [{ state, data }, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    expect(data.value).toStrictEqual(
      users.filter((u) => ["Alice", "Bob"].includes(u.name))
    );

    app.unmount();
  });

  it("doesn't update on changes not matching the query", async () => {
    const [{ state, data }, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    expect(data.value).toStrictEqual(
      users.filter((u) => ["Alice", "Bob"].includes(u.name))
    );

    app.unmount();
  });

  it("updates on changes matching the query", async () => {
    const [{ state, data }, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    const newUser: User = { id: "4", name: "Elise" };
    await insert(userTable, newUser);

    await new Promise((res) => setTimeout(res, 100));

    expect(data.value).toStrictEqual([
      ...users.filter((u) => ["Alice", "Bob"].includes(u.name)),
      newUser,
    ]);

    app.unmount();
  });
});
