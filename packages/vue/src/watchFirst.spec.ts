import { waitFor } from "@testing-library/vue";
import { clear, createDB, createTable, insert, insertMany, Table, update } from "blinkdb";
import { User, withSetup } from "./testutils";
import { watchFirst } from "./watchFirst";

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
  const [result, app] = withSetup(() => watchFirst(userTable));

  expect(result.value.state).toBe("loading");
  expect(result.value.data).toBe(undefined);

  app.unmount();
});

test("shows done state on subsequent renders", async () => {
  const [result, app] = withSetup(() => watchFirst(userTable));

  await waitFor(() => {
    expect(result.value.state).toBe("done");
  });
  expect(result.value.data).toStrictEqual(null);

  app.unmount();
});

describe("without filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user", async () => {
    const [result, app] = withSetup(() => watchFirst(userTable));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(users[0]);

    app.unmount();
  });

  it("returns undefined if no users in table", async () => {
    await clear(userTable);
    const [result, app] = withSetup(() => watchFirst(userTable));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toBe(null);

    app.unmount();
  });

  it("updates on changes", async () => {
    const [result, app] = withSetup(() => watchFirst(userTable));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    const newUser: User = { id: "", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.value.data).toStrictEqual(newUser);
    });

    app.unmount();
  });
});

describe("with filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user matching filter", async () => {
    const [result, app] = withSetup(() =>
      watchFirst(userTable, { where: { name: "Bob" } })
    );

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(users[1]);

    app.unmount();
  });

  it("returns undefined if no person matches filter", async () => {
    const [result, app] = withSetup(() =>
      watchFirst(userTable, { where: { name: "Bobby" } })
    );

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toBe(null);

    app.unmount();
  });

  it("doesn't update on changes not matching the query", async () => {
    const [result, app] = withSetup(() =>
      watchFirst(userTable, { where: { name: "Bob" } })
    );

    const newUser: User = { id: "", name: "Delta" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(users[1]);

    app.unmount();
  });

  it("updates on changes matching the query", async () => {
    const [result, app] = withSetup(() =>
      watchFirst(userTable, { where: { name: "Bob" } })
    );

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    const newUser: User = { id: "", name: "Bob" };
    await insert(userTable, newUser);

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(newUser);

    app.unmount();
  });
});

describe("with id", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user with the given id", async () => {
    const [result, app] = withSetup(() => watchFirst(userTable, "0"));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual(users[0]);

    app.unmount();
  });

  it("returns undefined if no person matches id", async () => {
    const [result, app] = withSetup(() => watchFirst(userTable, "999"));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toBe(null);

    app.unmount();
  });

  it("updates on changes matching the query", async () => {
    const [result, app] = withSetup(() => watchFirst(userTable, "0"));

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });

    await update(userTable, { ...users[0], name: "Alice the II." });

    await waitFor(() => {
      expect(result.value.state).toBe("done");
    });
    expect(result.value.data).toStrictEqual({ ...users[0], name: "Alice the II." });

    app.unmount();
  });
});
