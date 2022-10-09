import { createDB, createTable, insert, Table } from "../../core";
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

it("should use the primary index for queries containing the primary index", () => {
  expect(selectForWhere(userTable, { id: "0" }, jest.fn())).toStrictEqual({
    rowScanned: "id",
    fullTableScan: false,
  });
  expect(selectForWhere(userTable, { id: { $in: ["0", "1"] } }, jest.fn())).toStrictEqual(
    {
      rowScanned: "id",
      fullTableScan: false,
    }
  );
  expect(selectForWhere(userTable, { id: "0", age: 40 }, jest.fn())).toStrictEqual({
    rowScanned: "id",
    fullTableScan: false,
  });
});

it("should use other indexes for queries containing that particular index", () => {
  expect(selectForWhere(userTable, { age: 40 }, jest.fn())).toStrictEqual({
    rowScanned: "age",
    fullTableScan: false,
  });
  expect(
    selectForWhere(userTable, { age: { $between: [0, 10] } }, jest.fn())
  ).toStrictEqual({
    rowScanned: "age",
    fullTableScan: false,
  });
});

it("should use a full table scan if no indexes are used in the query", () => {
  expect(selectForWhere(userTable, { name: "Alice" }, jest.fn())).toStrictEqual({
    fullTableScan: true,
  });
  expect(selectForWhere(userTable, { name: { $gt: "A" } }, jest.fn())).toStrictEqual({
    fullTableScan: true,
  });
});
