import { waitFor } from "@testing-library/vue";
import { createDB, createTable, insertMany, Table, update } from "blinkdb";
import { User, withSetup } from "./testutils";
import { watchOne } from "./watchOne";

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
  const [{ state, data }, app] = withSetup(() => watchOne(userTable, "0"));

  expect(state.value).toBe("loading");
  expect(data.value).toBe(undefined);

  app.unmount();
});

test("shows done state on subsequent renders", async () => {
  await insertMany(userTable, users);
  const [{ state, data }, app] = withSetup(() => watchOne(userTable, "0"));

  await waitFor(() => {
    expect(state.value).toBe("done");
  });

  app.unmount();
});

describe("with filter", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns first user matching filter", async () => {
    const [{ state, data }, app] = withSetup(() =>
      watchOne(userTable, { where: { name: "Bob" } })
    );

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual(users[1]);

    app.unmount();
  });

  it("returns error if no user matches filter", async () => {
    const [{ state, data, error }, app] = withSetup(() =>
      watchOne(userTable, { where: { name: "Bobby" } })
    );

    await waitFor(() => {
      expect(state.value).toBe("error");
    });
    expect(data.value).toBe(undefined);
    expect(error.value?.message).toMatch(/No item found/);

    app.unmount();
  });

  it("returns error if more than one user matches filter", async () => {
    const [{ state, data, error }, app] = withSetup(() =>
      watchOne(userTable, { where: { name: { in: ["Alice", "Bob"] } } })
    );

    await waitFor(() => {
      expect(state.value).toBe("error");
    });
    expect(data.value).toBe(undefined);
    expect(error.value?.message).toMatch(/More than one item found/);

    app.unmount();
  });

  it("doesn't update on changes not matching the query", async () => {
    const [{ state, data }, app] = withSetup(() =>
      watchOne(userTable, { where: { name: "Bob" } })
    );

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    await update(userTable, { ...users[0], name: "Alice the II." });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual(users[1]);

    app.unmount();
  });

  it("updates on changes matching the query", async () => {
    const [{ state, data }, app] = withSetup(() =>
      watchOne(userTable, { where: { id: "1" } })
    );

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    await update(userTable, { ...users[1], name: "Bob the II." });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual({ ...users[1], name: "Bob the II." });

    app.unmount();
  });
});

describe("with id", () => {
  beforeEach(async () => {
    await insertMany(userTable, users);
  });

  it("returns user with the given id", async () => {
    const [{ state, data }, app] = withSetup(() => watchOne(userTable, "0"));

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual(users[0]);

    app.unmount();
  });

  it("returns error if no user matches id", async () => {
    const [{ state, data, error }, app] = withSetup(() => watchOne(userTable, "123"));

    await waitFor(() => {
      expect(state.value).toBe("error");
    });
    expect(data.value).toBe(undefined);
    expect(error.value?.message).toMatch(/No item found/);

    app.unmount();
  });

  it("updates on changes not matching the id", async () => {
    const [{ state, data }, app] = withSetup(() => watchOne(userTable, "0"));

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    await update(userTable, { ...users[1], name: "Bob the II." });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual(users[0]);

    app.unmount();
  });

  it("updates on changes matching the id", async () => {
    const [{ state, data }, app] = withSetup(() => watchOne(userTable, "0"));

    await waitFor(() => {
      expect(state.value).toBe("done");
    });

    await update(userTable, { ...users[0], name: "Alice the II." });

    await waitFor(() => {
      expect(state.value).toBe("done");
    });
    expect(data.value).toStrictEqual({ ...users[0], name: "Alice the II." });

    app.unmount();
  });
});
