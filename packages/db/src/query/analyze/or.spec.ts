import { BlinkKey, createDB, createTable, insert, Table } from "../../core";
import { analyzeOr } from "./or";
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
  expect(analyzeOr(table, { OR: [] })).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const andResult = analyzeOr(table, { OR: [{ id: { gt: "abc" } }] });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.primary, {
    gt: "abc",
  });
  expect(andResult).toBe(matcherResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const andResult = analyzeOr(table, { OR: [{ age: { gt: 2 } }] });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    gt: 2,
  });
  expect(andResult).toBe(matcherResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const andResult = analyzeOr(table, { OR: [{ name: { gt: "abc" } }] });
  expect(andResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the sum of all matchers if more than one is specified", () => {
  const andResult = analyzeOr(table, {
    OR: [{ id: { lt: "10" } }, { age: { lt: 0 } }],
  });
  const matcherResult1 = analyzeMatcher(table[BlinkKey].storage.primary, {
    lt: "10",
  });
  const matcherResult2 = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    lt: 0,
  });
  expect(andResult).toBe(matcherResult1 + matcherResult2);
});
