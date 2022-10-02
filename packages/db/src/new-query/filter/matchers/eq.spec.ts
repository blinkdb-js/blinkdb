import { matchesEqMatcher } from "./eq";

it("should work with numbers", () => {
  expect(matchesEqMatcher(1, 2)).toBe(false);
  expect(matchesEqMatcher(2, 2)).toBe(true);
  expect(matchesEqMatcher(0, 300)).toBe(false);
  expect(matchesEqMatcher(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(true);
  expect(matchesEqMatcher(3, undefined)).toBe(false);
  expect(matchesEqMatcher(null, 5)).toBe(false);
});

it("should work with strings", () => {
  expect(matchesEqMatcher("a", "b")).toBe(false);
  expect(matchesEqMatcher("ac", "ac")).toBe(true);
  expect(matchesEqMatcher("", "dddddd")).toBe(false);
  expect(matchesEqMatcher("xyz", "xyz")).toBe(true);
  expect(matchesEqMatcher(undefined, "Hello")).toBe(false);
  expect(matchesEqMatcher("5", null)).toBe(false);
});

it("should work with booleans", () => {
  expect(matchesEqMatcher(false, true)).toBe(false);
  expect(matchesEqMatcher(true, true)).toBe(true);
  expect(matchesEqMatcher(true, false)).toBe(false);
  expect(matchesEqMatcher(false, false)).toBe(true);
  expect(matchesEqMatcher(undefined, false)).toBe(false);
  expect(matchesEqMatcher(true, null)).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesEqMatcher(BigInt(1), BigInt(2))).toBe(false);
  expect(matchesEqMatcher(BigInt(2), BigInt(2))).toBe(true);
  expect(matchesEqMatcher(BigInt(0), BigInt(300))).toBe(false);
  expect(matchesEqMatcher(BigInt(Number.MAX_SAFE_INTEGER), BigInt(Number.MAX_SAFE_INTEGER))).toBe(true);
  expect(matchesEqMatcher(BigInt(3), undefined)).toBe(false);
  expect(matchesEqMatcher(null, BigInt(5))).toBe(false);
});

it("should work with objects", () => {
  expect(matchesEqMatcher({ a: 1 }, { a: 2 })).toBe(false);
  expect(matchesEqMatcher({ b: 2 }, { b: 2 })).toBe(true);
  expect(matchesEqMatcher({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  expect(matchesEqMatcher({ "x": "Hello" }, { x: "World" })).toBe(false);
  expect(matchesEqMatcher(undefined, { x: "yz" })).toBe(false);
  expect(matchesEqMatcher({ a: "bc" }, null)).toBe(false);
});

it("should work with arrays", () => {
  expect(matchesEqMatcher([1], [12])).toBe(false);
  expect(matchesEqMatcher([1], [1, 2])).toBe(false);
  expect(matchesEqMatcher([10, 20], [10, 20])).toBe(true);
  expect(matchesEqMatcher([20, 10], [10, 20])).toBe(true);
  expect(matchesEqMatcher([5, 7, 9], [7, 9, 5])).toBe(true);
  expect(matchesEqMatcher([3, 5, 7], [7, 5, 9])).toBe(false);
  expect(matchesEqMatcher([16], undefined)).toBe(false);
  expect(matchesEqMatcher(null, [12])).toBe(false);
});

it("should work with dates", () => {
  expect(matchesEqMatcher(new Date("2022-01-01"), new Date("2022-01-03"))).toBe(false);
  expect(matchesEqMatcher(new Date("2022-01-01"), new Date("2022-01-01"))).toBe(true);
  expect(matchesEqMatcher(new Date("2022-01-01T00:10:10"), new Date("2022-01-01T00:10:10"))).toBe(true);
  expect(matchesEqMatcher(new Date("2022-01-01T00:12:34"), new Date("2022-01-03T00:12:34"))).toBe(false);
});

it("should compare by type too", () => {
  expect(matchesEqMatcher(true, "true" as any)).toBe(false);
  expect(matchesEqMatcher(3, "3" as any)).toBe(false);
  expect(matchesEqMatcher(null, undefined)).toBe(false);
});