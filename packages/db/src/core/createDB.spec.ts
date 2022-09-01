import { createDB } from "./createDB";
import { uuid } from "./uuid";
import { table } from "./table";
import { create } from "./create";
import { one } from "./one";

test("should create a db without options", () => {
  createDB();
});

test("should create a db with options", () => {
  createDB({
    clone: false,
  });
});

describe("options", () => {
  describe("clone", () => {
    it("should clone by default", async () => {
      interface User {
        id: string;
        name: string;
      }

      const user: User = { id: uuid(), name: "Alex" };
      const db = createDB();
      const userTable = table(db, "users")();
      const id = await create(userTable, user);
      const retrievedUser = await one(userTable, { where: { id } });

      expect(retrievedUser).not.toBe(user);
      expect(retrievedUser).toStrictEqual(user);
    });

    it("should not clone by if set to false", async () => {
      interface User {
        id: string;
        name: string;
      }

      const user: User = { id: uuid(), name: "Alex" };
      const db = createDB({
        clone: false,
      });
      const userTable = table(db, "users")();
      const id = await create(userTable, user);
      const retrievedUser = await one(userTable, { where: { id } });

      expect(retrievedUser).toBe(user);
      expect(retrievedUser).toStrictEqual(user);
    });
  });
});
