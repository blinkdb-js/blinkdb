import { createDB, createTable, insert, Table } from "../../core";
import { selectForAnd } from "./and";
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

it("should return no rows for an empty AND", () => {
  expect(selectForAnd(userTable, { AND: [] }, jest.fn())).toStrictEqual({
    fullTableScan: false,
  });
});

it("should use that query if only one query exists", () => {
  expect(selectForAnd(userTable, { AND: [{ id: "0" }] }, jest.fn())).toStrictEqual(
    selectForWhere(userTable, { id: "0" }, jest.fn())
  );
  expect(
    selectForAnd(userTable, { AND: [{ age: { between: [0, 2] } }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { age: { between: [0, 2] } }, jest.fn()));
});

it("should use the best performing query if multiple queries exist", () => {
  expect(
    selectForAnd(userTable, { AND: [{ id: "0" }, { age: { gt: 40 } }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { id: "0" }, jest.fn()));
  expect(
    selectForAnd(userTable, { AND: [{ age: 40 }, { id: { gt: "0" } }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { age: 40 }, jest.fn()));
  expect(
    selectForAnd(userTable, { AND: [{ age: 40 }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { age: 40 }, jest.fn()));
  expect(
    selectForAnd(userTable, { AND: [{ id: { gte: "0" } }, { name: "Alice" }] }, jest.fn())
  ).toStrictEqual(selectForWhere(userTable, { id: { gte: "0" } }, jest.fn()));
});
