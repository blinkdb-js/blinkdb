import { matchesLteMatcher } from "./lte";

it("should work with numbers", () => {
  expect(matchesLteMatcher(1, { $lte: 2 })).toBe(true);
  expect(matchesLteMatcher(2, { $lte: 2 })).toBe(true);
  expect(matchesLteMatcher(3, { $lte: 2 })).toBe(false);
  expect(matchesLteMatcher(Number.MAX_SAFE_INTEGER, { $lte: 2 })).toBe(false);
  expect(matchesLteMatcher(undefined, { $lte: 3 })).toBe(false);
  expect(matchesLteMatcher(null, { $lte: 10 })).toBe(true);
});

it("should work with strings", () => {
  expect(matchesLteMatcher("a", { $lte: "b" })).toBe(true);
  expect(matchesLteMatcher("b", { $lte: "b" })).toBe(true);
  expect(matchesLteMatcher("c", { $lte: "b" })).toBe(false);
  expect(matchesLteMatcher("", { $lte: "" })).toBe(true);
  expect(matchesLteMatcher(undefined, { $lte: "b" })).toBe(false);
  expect(matchesLteMatcher(null, { $lte: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesLteMatcher(BigInt(1), { $lte: BigInt(2) })).toBe(true);
  expect(matchesLteMatcher(BigInt(2), { $lte: BigInt(2) })).toBe(true);
  expect(matchesLteMatcher(BigInt(3), { $lte: BigInt(2) })).toBe(false);
  expect(matchesLteMatcher(undefined, { $lte: BigInt(3) })).toBe(false);
  expect(matchesLteMatcher(null, { $lte: BigInt(3) })).toBe(true);
});

it("should work with dates", () => {
  expect(matchesLteMatcher(new Date("2022-01-01"), { $lte: new Date("2022-01-02") })).toBe(true);
  expect(matchesLteMatcher(new Date("2022-01-02"), { $lte: new Date("2022-01-02") })).toBe(true);
  expect(matchesLteMatcher(new Date("2022-01-03"), { $lte: new Date("2022-01-02") })).toBe(false);
  expect(matchesLteMatcher(undefined, { $lte: new Date("2022-01-02") })).toBe(false);
  expect(matchesLteMatcher(null, { $lte: new Date("2022-01-02") })).toBe(true);
});

it("should work with null / undefined", () => {
  expect(matchesLteMatcher(null, { $lte: null })).toBe(true);
  expect(matchesLteMatcher(undefined, { $lte: undefined })).toBe(false);
});