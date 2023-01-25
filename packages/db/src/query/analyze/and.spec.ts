import { BlinkKey, createDB, createTable, insertMany, Table } from "../../core";
import { User, generateRandomUsers } from "../../tests/utils";
import { analyzeAnd } from "./and";
import { analyzeMatcher } from "./matchers";

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
  expect(analyzeAnd(userTable, { AND: [] })).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const andResult = analyzeAnd(userTable, { AND: [{ id: { gt: "abc" } }] });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.primary, {
    gt: "abc",
  });

  expect(matcherResult).toBe(andResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const andResult = analyzeAnd(userTable, { AND: [{ age: { gt: 2 } }] });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    gt: 2,
  });

  expect(matcherResult).toBeLessThan(andResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const andResult = analyzeAnd(userTable, { AND: [{ name: { gt: "abc" } }] });

  expect(andResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the better matcher if more than one is specified", () => {
  const andResult = analyzeAnd(userTable, {
    AND: [{ id: { lt: "10" } }, { age: { lt: 0 } }],
  });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    lt: 0,
  });

  expect(matcherResult).toBeLessThan(andResult);
});
