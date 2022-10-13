import { matchesEq } from "./eq";

it("should work with numbers", () => {
  expect(matchesEq(1, 2)).toBe(false);
  expect(matchesEq(2, 2)).toBe(true);
  expect(matchesEq(0, 300)).toBe(false);
  expect(matchesEq(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe(true);
  expect(matchesEq(3, undefined)).toBe(false);
  expect(matchesEq(null, 5)).toBe(false);
});

it("should work with strings", () => {
  expect(matchesEq("a", "b")).toBe(false);
  expect(matchesEq("ac", "ac")).toBe(true);
  expect(matchesEq("", "dddddd")).toBe(false);
  expect(matchesEq("xyz", "xyz")).toBe(true);
  expect(matchesEq(undefined, "Hello")).toBe(false);
  expect(matchesEq("5", null)).toBe(false);
});

it("should work with booleans", () => {
  expect(matchesEq(false, true)).toBe(false);
  expect(matchesEq(true, true)).toBe(true);
  expect(matchesEq(true, false)).toBe(false);
  expect(matchesEq(false, false)).toBe(true);
  expect(matchesEq(undefined, false)).toBe(false);
  expect(matchesEq(true, null)).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesEq(BigInt(1), BigInt(2))).toBe(false);
  expect(matchesEq(BigInt(2), BigInt(2))).toBe(true);
  expect(matchesEq(BigInt(0), BigInt(300))).toBe(false);
  expect(
    matchesEq(BigInt(Number.MAX_SAFE_INTEGER), BigInt(Number.MAX_SAFE_INTEGER))
  ).toBe(true);
  expect(matchesEq(BigInt(3), undefined)).toBe(false);
  expect(matchesEq(null, BigInt(5))).toBe(false);
});

it("should work with objects", () => {
  expect(matchesEq({ a: 1 }, { a: 2 })).toBe(false);
  expect(matchesEq({ b: 2 }, { b: 2 })).toBe(true);
  expect(matchesEq({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  expect(matchesEq({ x: "Hello" }, { x: "World" })).toBe(false);
  expect(matchesEq(undefined, { x: "yz" })).toBe(false);
  expect(matchesEq({ a: "bc" }, null)).toBe(false);
});

it("should work with arrays", () => {
  expect(matchesEq([1], [12])).toBe(false);
  expect(matchesEq([1], [1, 2])).toBe(false);
  expect(matchesEq([10, 20], [10, 20])).toBe(true);
  expect(matchesEq([20, 10], [10, 20])).toBe(true);
  expect(matchesEq([5, 7, 9], [7, 9, 5])).toBe(true);
  expect(matchesEq([3, 5, 7], [7, 5, 9])).toBe(false);
  expect(matchesEq([16], undefined)).toBe(false);
  expect(matchesEq(null, [12])).toBe(false);
});

it("should work with dates", () => {
  expect(matchesEq(new Date("2022-01-01"), new Date("2022-01-03"))).toBe(false);
  expect(matchesEq(new Date("2022-01-01"), new Date("2022-01-01"))).toBe(true);
  expect(
    matchesEq(new Date("2022-01-01T00:10:10"), new Date("2022-01-01T00:10:10"))
  ).toBe(true);
  expect(
    matchesEq(new Date("2022-01-01T00:12:34"), new Date("2022-01-03T00:12:34"))
  ).toBe(false);
});

it("should compare by type too", () => {
  expect(matchesEq(true, "true" as any)).toBe(false);
  expect(matchesEq(3, "3" as any)).toBe(false);
  expect(matchesEq(null, undefined)).toBe(false);
});
