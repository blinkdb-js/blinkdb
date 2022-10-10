import { BlinkKey, createDB, createTable, insert, Table } from "../../core";
import { analyzeAnd } from "./and";
import { analyzeMatcher } from "./matchers";

interface User {
  id: string;
  name: string;
  age: number;
}

let table: Table<User, "id">;

beforeAll(async () => {
  const db = createDB();
  table = createTable<User>(
    db,
    "users"
  )({
    primary: "id",
    indexes: ["age"],
  });
  for (let i = 0; i < 100; i++) {
    await insert(table, { id: String(i), name: "Name", age: i % 100 });
  }
});

it("should return 0 if and is empty", () => {
  expect(analyzeAnd(table, { $and: [] })).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const andResult = analyzeAnd(table, { $and: [{ id: { $gt: "abc" } }] });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.primary, { $gt: "abc" });
  expect(andResult).toBe(matcherResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const andResult = analyzeAnd(table, { $and: [{ age: { $gt: 2 } }] });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    $gt: 2,
  });
  expect(andResult).toBe(matcherResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const andResult = analyzeAnd(table, { $and: [{ name: { $gt: "abc" } }] });
  expect(andResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the better matcher if more than one is specified", () => {
  const andResult = analyzeAnd(table, {
    $and: [{ id: { $lt: "10" } }, { age: { $lt: 0 } }],
  });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    $lt: 0,
  });
  expect(andResult).toBe(matcherResult);
});
