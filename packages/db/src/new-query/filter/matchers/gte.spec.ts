import { matchesGteMatcher } from "./gte";

it("should work with numbers", () => {
  expect(matchesGteMatcher(1, { $gte: 2 })).toBe(false);
  expect(matchesGteMatcher(2, { $gte: 2 })).toBe(true);
  expect(matchesGteMatcher(3, { $gte: 2 })).toBe(true);
  expect(matchesGteMatcher(Number.MAX_SAFE_INTEGER, { $gte: 2 })).toBe(true);
  expect(matchesGteMatcher(undefined, { $gte: 3 })).toBe(false);
  expect(matchesGteMatcher(null, { $gte: 10 })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesGteMatcher("a", { $gte: "b" })).toBe(false);
  expect(matchesGteMatcher("b", { $gte: "b" })).toBe(true);
  expect(matchesGteMatcher("c", { $gte: "b" })).toBe(true);
  expect(matchesGteMatcher("", { $gte: "" })).toBe(true);
  expect(matchesGteMatcher(undefined, { $gte: "b" })).toBe(false);
  expect(matchesGteMatcher(null, { $gte: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesGteMatcher(BigInt(1), { $gte: BigInt(2) })).toBe(false);
  expect(matchesGteMatcher(BigInt(2), { $gte: BigInt(2) })).toBe(true);
  expect(matchesGteMatcher(BigInt(3), { $gte: BigInt(2) })).toBe(true);
  expect(matchesGteMatcher(undefined, { $gte: BigInt(3) })).toBe(false);
  expect(matchesGteMatcher(null, { $gte: BigInt(3) })).toBe(false);
});

it("should work with dates", () => {
  expect(matchesGteMatcher(new Date("2022-01-01"), { $gte: new Date("2022-01-02") })).toBe(false);
  expect(matchesGteMatcher(new Date("2022-01-02"), { $gte: new Date("2022-01-02") })).toBe(true);
  expect(matchesGteMatcher(new Date("2022-01-03"), { $gte: new Date("2022-01-02") })).toBe(true);
  expect(matchesGteMatcher(undefined, { $gte: new Date("2022-01-02") })).toBe(false);
  expect(matchesGteMatcher(null, { $gte: new Date("2022-01-02") })).toBe(false);
});

it("should work with null / undefined", () => {
  expect(matchesGteMatcher(null, { $gte: null })).toBe(true);
  expect(matchesGteMatcher(undefined, { $gte: undefined })).toBe(false);
});