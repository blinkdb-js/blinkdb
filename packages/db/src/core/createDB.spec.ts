import { createDB } from "./createDB";
import { createTable } from "./createTable";
import { insert } from "./insert";
import { one } from "./one";
import { uuid } from "./uuid";

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
      const userTable = createTable(db, "users")();
      const id = await insert(userTable, user);
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
      const userTable = createTable(db, "users")();
      const id = await insert(userTable, user);
      const retrievedUser = await one(userTable, { where: { id } });

      expect(retrievedUser).toBe(user);
      expect(retrievedUser).toStrictEqual(user);
    });
  });
});
