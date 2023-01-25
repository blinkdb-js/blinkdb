import { createDB, createTable, insertMany, Table } from "../../core";
import { User, generateRandomUsers } from "../../tests/utils";
import { selectForOr } from "./or";
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

it("should return no rows for an empty OR", () => {
  expect(selectForOr(userTable, { OR: [] }, jest.fn())).toStrictEqual({
    fullTableScan: false,
  });
});

it("should use that query if only one query exists", () => {
  expect(selectForOr(userTable, { OR: [{ id: "0" }] }, jest.fn())).toStrictEqual(
    selectForWhere(userTable, { id: "0" }, jest.fn())
  );
  expect(
    selectForOr(userTable, { OR: [{ age: { between: [0, 2] } }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { age: { between: [0, 2] } }, jest.fn()));
});

it("should use all queries if multiple queries exist", () => {
  expect(
    selectForOr(userTable, { OR: [{ id: "0" }, { age: { gt: 40 } }] }, jest.fn())
  ).toStrictEqual({
    rowsScanned: ["id", "age"],
    fullTableScan: false,
  });
  expect(
    selectForOr(userTable, { OR: [{ age: 40 }, { id: { gt: "0" } }] }, jest.fn())
  ).toStrictEqual({
    rowsScanned: ["age", "id"],
    fullTableScan: false,
  });
});

it("should use a full table scan if one of the queries is a full table scan", () => {
  expect(
    selectForOr(userTable, { OR: [{ age: 40 }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual({
    fullTableScan: true,
  });
  expect(
    selectForOr(userTable, { OR: [{ id: { gte: "0" } }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual({
    fullTableScan: true,
  });
});
