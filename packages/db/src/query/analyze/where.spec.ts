import { BlinkKey, createDB, createTable, insertMany, Table } from "../../core";
import { User, generateRandomUsers } from "../../tests/utils";
import { analyzeMatcher } from "./matchers";
import { analyzeWhere } from "./where";

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

it("should return 0 if where is empty", () => {
  expect(analyzeWhere(userTable, {})).toBe(0);
});

it("should return the complexity of the matcher if only one is specified (primary)", () => {
  const whereResult = analyzeWhere(userTable, { id: { gt: "abc" } });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.primary, {
    gt: "abc",
  });

  expect(matcherResult).toBe(whereResult);
});

it("should return the complexity of the matcher if only one is specified (index)", () => {
  const whereResult = analyzeWhere(userTable, { age: { gt: 2 } });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    gt: 2,
  });

  expect(matcherResult).toBeLessThan(whereResult);
});

it("should return Number.MAX_SAFE_INTEGER if a key without index is specified", () => {
  const whereResult = analyzeWhere(userTable, { name: { gt: "abc" } });

  expect(whereResult).toBe(Number.MAX_SAFE_INTEGER);
});

it("should return the better matcher if more than one is specified", () => {
  const whereResult = analyzeWhere(userTable, {
    id: { lt: "10" },
    age: { lt: 0 },
  });
  const matcherResult = analyzeMatcher(userTable[BlinkKey].storage.indexes["age"]!, {
    lt: 0,
  });

  expect(matcherResult).toBeLessThan(whereResult);
});
