import { createDB, createTable, insert, Table } from "../../core";
import { selectForOr } from "./or";
import { selectForWhere } from "./where";

interface User {
  id: string;
  name: string;
  age: number;
}

let userTable: Table<User, "id">;

beforeEach(async () => {
  const db = createDB();
  userTable = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["age"],
  });
  await insert(userTable, { id: "0", name: "Alice", age: 40 });
  await insert(userTable, { id: "1", name: "Bob", age: 50 });
  await insert(userTable, { id: "2", name: "Charlie", age: 60 });
});

it("should return no rows for an empty $or", () => {
  expect(selectForOr(userTable, { $or: [] }, jest.fn())).toStrictEqual({
    fullTableScan: false,
  });
});

it("should use that query if only one query exists", () => {
  expect(selectForOr(userTable, { $or: [{ id: "0" }] }, jest.fn())).toStrictEqual(
    selectForWhere(userTable, { id: "0" }, jest.fn())
  );
  expect(
    selectForOr(userTable, { $or: [{ age: { $between: [0, 2] } }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { age: { $between: [0, 2] } }, jest.fn()));
});

it("should use all queries if multiple queries exist", () => {
  expect(
    selectForOr(userTable, { $or: [{ id: "0" }, { age: { $gt: 40 } }] }, jest.fn())
  ).toStrictEqual({
    rowsScanned: ["id", "age"],
    fullTableScan: false,
  });
  expect(
    selectForOr(userTable, { $or: [{ age: 40 }, { id: { $gt: "0" } }] }, jest.fn())
  ).toStrictEqual({
    rowsScanned: ["age", "id"],
    fullTableScan: false,
  });
});

it("should use a full table scan if one of the queries is a full table scan", () => {
  expect(
    selectForOr(userTable, { $or: [{ age: 40 }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual({
    fullTableScan: true,
  });
  expect(
    selectForOr(userTable, { $or: [{ id: { $gte: "0" } }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual({
    fullTableScan: true,
  });
});
