import { waitFor } from "@testing-library/vue";
import { createDB, createTable, insert, insertMany, Table } from "blinkdb";
import { User, withSetup } from "./testUtils";
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
  const [result, app] = withSetup(() => watchMany(userTable));

  expect(result.value.state).toBe("loading");
  expect(result.value.data).toBe(undefined);

  app.unmount();
});

test("shows done state on subsequent renders", async () => {
  const [result, app] = withSetup(() => watchMany(userTable));

  await waitFor(() => {
    expect(result.value.state).toBe("done");
  });
  expect(result.value.data).toStrictEqual([]);

  app.unmount();
});

describe("without filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const [result, app] = withSetup(() => watchMany(userTable));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(users);

    app.unmount();
  });

  it("updates on changes", async () => {
    const [result, app] = withSetup(() => watchMany(userTable));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.value.data).toStrictEqual([...users, newUser]);
    });

    app.unmount();
  });
});

describe("with filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns users", async () => {
    const [result, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    expect(result.value.data).toStrictEqual(
      users.filter((u) => ["Alice", "Bob"].includes(u.name))
    );

    app.unmount();
  });

  it("doesn't update on changes not matching the query", async () => {
    const [result, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    const newUser: User = { id: "4", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    expect(result.value.data).toStrictEqual(
      users.filter((u) => ["Alice", "Bob"].includes(u.name))
    );

    app.unmount();
  });

  it("updates on changes matching the query", async () => {
    const [result, app] = withSetup(() => {
      return watchMany(userTable, { where: { name: { in: ["Alice", "Bob", "Elise"] } } });
    });

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    const newUser: User = { id: "4", name: "Elise" };
    await insert(userTable, newUser);

    await new Promise((res) => setTimeout(res, 100));

    expect(result.value.data).toStrictEqual([
      ...users.filter((u) => ["Alice", "Bob"].includes(u.name)),
      newUser,
    ]);

    app.unmount();
  });
});
