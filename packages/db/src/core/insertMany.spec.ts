import { generateRandomUsers, User } from "../tests/utils";
import { createDB, Database } from "./createDB";
import { createTable, Table } from "./createTable";
import { insertMany } from "./insertMany";
import { one } from "./one";
import { use } from "./use";

let users: User[];
let userTable: Table<User, "id">;

beforeEach(async () => {
  users = generateRandomUsers();
  const db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["name"],
  });
});

it("should return the primary keys of all inserted items", async () => {
  const ids = await insertMany(userTable, users);
  expect(ids).toStrictEqual(users.map((u) => u.id));
});

it("should insert items retrievable by primary key", async () => {
  const [aliceId] = await insertMany(userTable, [users[0]]);
  const user = await one(userTable, { where: { id: aliceId } });

  expect(user).toStrictEqual(users[0]);
});

it("should insert items retrievable by index", async () => {
  const aliceId = await insertMany(userTable, [users[0]]);
  const user = await one(userTable, { where: { name: users[0].name } });

  expect(user).toStrictEqual(users[0]);
});

it("should insert items retrievable by property", async () => {
  const aliceId = await insertMany(userTable, [users[0]]);
  const user = await one(userTable, { where: { age: users[0].age } });

  expect(user).toStrictEqual(users[0]);
});

it("should prevent duplicate primary keys", async () => {
  const fn = async () => await insertMany(userTable, [users[0], users[0]]);
  expect(fn).rejects.toThrowError(`Primary key ${users[0].id} already in use`);
});

it("should execute insertMany hooks", async () => {
  const fn = jest.fn();

  use(userTable, (ctx) => fn(ctx.action));
  await insertMany(userTable, [users[0], users[1]]);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith("insertMany");
});
