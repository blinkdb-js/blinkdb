import { matchesGtMatcher } from "./gt";

it("should work with numbers", () => {
  expect(matchesGtMatcher(1, { $gt: 2 })).toBe(false);
  expect(matchesGtMatcher(2, { $gt: 2 })).toBe(false);
  expect(matchesGtMatcher(3, { $gt: 2 })).toBe(true);
  expect(matchesGtMatcher(Number.MAX_SAFE_INTEGER, { $gt: 2 })).toBe(true);
  expect(matchesGtMatcher(undefined, { $gt: 3 })).toBe(false);
  expect(matchesGtMatcher(null, { $gt: 10 })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesGtMatcher("a", { $gt: "b" })).toBe(false);
  expect(matchesGtMatcher("b", { $gt: "b" })).toBe(false);
  expect(matchesGtMatcher("c", { $gt: "b" })).toBe(true);
  expect(matchesGtMatcher("", { $gt: "" })).toBe(false);
  expect(matchesGtMatcher(undefined, { $gt: "b" })).toBe(false);
  expect(matchesGtMatcher(null, { $gt: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesGtMatcher(BigInt(1), { $gt: BigInt(2) })).toBe(false);
  expect(matchesGtMatcher(BigInt(2), { $gt: BigInt(2) })).toBe(false);
  expect(matchesGtMatcher(BigInt(3), { $gt: BigInt(2) })).toBe(true);
  expect(matchesGtMatcher(undefined, { $gt: BigInt(3) })).toBe(false);
  expect(matchesGtMatcher(null, { $gt: BigInt(3) })).toBe(false);
});

it("should work with dates", () => {
  expect(matchesGtMatcher(new Date("2022-01-01"), { $gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGtMatcher(new Date("2022-01-02"), { $gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGtMatcher(new Date("2022-01-03"), { $gt: new Date("2022-01-02") })).toBe(true);
  expect(matchesGtMatcher(undefined, { $gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGtMatcher(null, { $gt: new Date("2022-01-02") })).toBe(false);
});

it("should work with null / undefined", () => {
  expect(matchesGtMatcher(null, { $gt: null })).toBe(false);
  expect(matchesGtMatcher(undefined, { $gt: undefined })).toBe(false);
});