import { BlinkKey, createDB, createTable, insert, Table } from "../../core";
import { analyzeMatcher } from "./matchers";
import { analyzeWhere } from "./where";

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

it("should return 0 if where is empty", () => {
  expect(analyzeWhere(table, {})).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const whereResult = analyzeWhere(table, { id: { $gt: "abc" } });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.primary, { $gt: "abc" });
  expect(whereResult).toBe(matcherResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const whereResult = analyzeWhere(table, { age: { $gt: 2 } });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    $gt: 2,
  });
  expect(whereResult).toBe(matcherResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const whereResult = analyzeWhere(table, { name: { $gt: "abc" } });
  expect(whereResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the better matcher if more than one is specified", () => {
  const whereResult = analyzeWhere(table, {
    id: { $lt: "10" },
    age: { $lt: 0 },
  });
  const matcherResult = analyzeMatcher(table[BlinkKey].storage.indexes["age"]!, {
    $lt: 0,
  });
  expect(whereResult).toBe(matcherResult);
});
