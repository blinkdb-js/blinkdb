import { matchesLtMatcher } from "./lt";

it("should work with numbers", () => {
  expect(matchesLtMatcher(1, { $lt: 2 })).toBe(true);
  expect(matchesLtMatcher(2, { $lt: 2 })).toBe(false);
  expect(matchesLtMatcher(3, { $lt: 2 })).toBe(false);
  expect(matchesLtMatcher(Number.MAX_SAFE_INTEGER, { $lt: 2 })).toBe(false);
  expect(matchesLtMatcher(undefined, { $lt: 3 })).toBe(false);
  expect(matchesLtMatcher(null, { $lt: 10 })).toBe(true);
});

it("should work with strings", () => {
  expect(matchesLtMatcher("a", { $lt: "b" })).toBe(true);
  expect(matchesLtMatcher("b", { $lt: "b" })).toBe(false);
  expect(matchesLtMatcher("c", { $lt: "b" })).toBe(false);
  expect(matchesLtMatcher("", { $lt: "" })).toBe(false);
  expect(matchesLtMatcher(undefined, { $lt: "b" })).toBe(false);
  expect(matchesLtMatcher(null, { $lt: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesLtMatcher(BigInt(1), { $lt: BigInt(2) })).toBe(true);
  expect(matchesLtMatcher(BigInt(2), { $lt: BigInt(2) })).toBe(false);
  expect(matchesLtMatcher(BigInt(3), { $lt: BigInt(2) })).toBe(false);
  expect(matchesLtMatcher(undefined, { $lt: BigInt(3) })).toBe(false);
  expect(matchesLtMatcher(null, { $lt: BigInt(3) })).toBe(true);
});

it("should work with dates", () => {
  expect(matchesLtMatcher(new Date("2022-01-01"), { $lt: new Date("2022-01-02") })).toBe(true);
  expect(matchesLtMatcher(new Date("2022-01-02"), { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLtMatcher(new Date("2022-01-03"), { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLtMatcher(undefined, { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLtMatcher(null, { $lt: new Date("2022-01-02") })).toBe(true);
});

it("should work with null / undefined", () => {
  expect(matchesLtMatcher(null, { $lt: null })).toBe(false);
  expect(matchesLtMatcher(undefined, { $lt: undefined })).toBe(false);
});