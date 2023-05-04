import { generateRandomUsers, User } from "../tests/utils";
import { createDB } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { key } from "./key";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(db, "users")();
  await insertMany(userTable, users);
});

it("should return the primary key property of a table", () => {
  const pk = key(userTable);

  expect(pk).toBe("id");
});

it("should return the primary key property of an entity", () => {
  const pk = key(userTable, { id: "uuid" });

  expect(pk).toBe("uuid");
});

it("should return the primary key property of an entity as a promise", () => {
  const pk = key(userTable, Promise.resolve({ id: "uuid" }));

  expect(pk).resolves.toBe("uuid");
});

it("should return the primary key property of multiply entities", () => {
  const pk = key(userTable, [{ id: "uuid1" }, { id: "uuid2" }]);

  expect(pk).toStrictEqual(["uuid1", "uuid2"]);
});

it("should return the primary key property of an entity as a promise", () => {
  const pk = key(userTable, Promise.resolve([{ id: "uuid1" }, { id: "uuid2" }]));

  expect(pk).resolves.toStrictEqual(["uuid1", "uuid2"]);
});
