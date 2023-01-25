import { BlinkKey, createDB, createTable, insertMany, Table } from "../../core";
import { User, generateRandomUsers } from "../../tests/utils";
import { analyzeMatcher } from "./matchers";
import { analyzeOr } from "./or";

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

it("should return 0 if and is empty", () => {
  expect(analyzeOr(userTable, { OR: [] })).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const andResult = analyzeOr(userTable, { OR: [{ id: { gt: "abc" } }] });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.primary, {
    gt: "abc",
  });

  expect(matcherResult).toBe(andResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const andResult = analyzeOr(userTable, { OR: [{ age: { gt: 2 } }] });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    gt: 2,
  });

  expect(matcherResult).toBeLessThanOrEqual(andResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const andResult = analyzeOr(userTable, { OR: [{ name: { gt: "abc" } }] });

  expect(andResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the sum of all matchers if more than one is specified", () => {
  const andResult = analyzeOr(userTable, {
    OR: [{ id: { lt: "10" } }, { age: { lt: 0 } }],
  });
  const matcherResult1 = analyzeMatcher(userTable[BlinkKey].storage.primary, {
    lt: "10",
  });
  const matcherResult2 = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    lt: 0,
  });

  expect(matcherResult1 + matcherResult2).toBeLessThanOrEqual(andResult);
});
