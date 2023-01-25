import { createDB, createTable, insertMany, Table } from "../../core";
import { generateRandomUsers, User } from "../../tests/utils";
import { selectForWhere } from "./where";

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
    indexes: ["age"],
  });
  await insertMany(userTable, users);
});

it("should return no rows if where contains no matchers", () => {
  expect(selectForWhere(userTable, {}, jest.fn())).toStrictEqual({
    fullTableScan: false,
  });
});
it("should use the primary index for queries containing the primary index", () => {
  expect(selectForWhere(userTable, { id: "0" }, jest.fn())).toStrictEqual({
    rowsScanned: ["id"],
    fullTableScan: false,
  });
  expect(selectForWhere(userTable, { id: { in: ["0", "1"] } }, jest.fn())).toStrictEqual({
    rowsScanned: ["id"],
    fullTableScan: false,
  });
  expect(selectForWhere(userTable, { id: "0", age: 40 }, jest.fn())).toStrictEqual({
    rowsScanned: ["id"],
    fullTableScan: false,
  });
});

it("should use other indexes for queries containing that particular index", () => {
  expect(selectForWhere(userTable, { age: 40 }, jest.fn())).toStrictEqual({
    rowsScanned: ["age"],
    fullTableScan: false,
  });
  expect(
    selectForWhere(userTable, { age: { between: [0, 10] } }, jest.fn())
  ).toStrictEqual({
    rowsScanned: ["age"],
    fullTableScan: false,
  });
});

it("should use a full table scan if no indexes are used in the query", () => {
  expect(selectForWhere(userTable, { name: "Alice" }, jest.fn())).toStrictEqual({
    fullTableScan: true,
  });
  expect(selectForWhere(userTable, { name: { gt: "A" } }, jest.fn())).toStrictEqual({
    fullTableScan: true,
  });
});
