import { matchesInMatcher } from "./in";

it("should work with numbers", () => {
  expect(matchesInMatcher(1, { $in: [2] })).toBe(false);
  expect(matchesInMatcher(2, { $in: [2] })).toBe(true);
  expect(matchesInMatcher(0, { $in: [1, 2, 3] })).toBe(false);
  expect(
    matchesInMatcher(Number.MAX_SAFE_INTEGER, { $in: [10, 100, Number.MAX_SAFE_INTEGER] })
  ).toBe(true);
  expect(matchesInMatcher(3, { $in: [] })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesInMatcher("a", { $in: ["b"] })).toBe(false);
  expect(matchesInMatcher("b", { $in: ["b"] })).toBe(true);
  expect(matchesInMatcher("c", { $in: ["a", "b", "d"] })).toBe(false);
  expect(matchesInMatcher("", { $in: ["", "z", "zz", "zzz"] })).toBe(true);
  expect(matchesInMatcher("abc", { $in: [] })).toBe(false);
});

it("should work with booleans", () => {
  expect(matchesInMatcher(false, { $in: [true] })).toBe(false);
  expect(matchesInMatcher(true, { $in: [true] })).toBe(true);
  expect(matchesInMatcher(true, { $in: [false] })).toBe(false);
  expect(matchesInMatcher(false, { $in: [true, false] })).toBe(true);
  expect(matchesInMatcher(false, { $in: [] })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesInMatcher(BigInt(1), { $in: [BigInt(2), BigInt(3)] })).toBe(false);
  expect(matchesInMatcher(BigInt(2), { $in: [BigInt(2), BigInt(3)] })).toBe(true);
  expect(matchesInMatcher(BigInt(0), { $in: [BigInt(300)] })).toBe(false);
  expect(matchesInMatcher(BigInt(1000), { $in: [] })).toBe(false);
});

it("should work with objects", () => {
  expect(matchesInMatcher({ a: 1 }, { $in: [{ a: 2 }] })).toBe(false);
  expect(matchesInMatcher({ b: 2 }, { $in: [{ b: 2 }] })).toBe(true);
  expect(
    matchesInMatcher({ a: 1, b: 2 }, { $in: [{ a: 2 }, { c: 3 }, { a: 1, b: 2 }] })
  ).toBe(true);
  expect(matchesInMatcher({ x: "Hello" }, { $in: [{ x: "World" }] })).toBe(false);
  expect(matchesInMatcher({ a: "b" }, { $in: [] })).toBe(false);
});

it("should work with arrays", () => {
  expect(matchesInMatcher([1], { $in: [[12]] })).toBe(false);
  expect(matchesInMatcher([1], { $in: [[1, 2], []] })).toBe(false);
  expect(matchesInMatcher([10, 20], { $in: [[10, 20]] })).toBe(true);
  expect(matchesInMatcher([20, 10], { $in: [[10, 20]] })).toBe(true);
  expect(matchesInMatcher([1, 2, 3, 4], { $in: [] })).toBe(false);
});

it("should work with dates", () => {
  expect(
    matchesInMatcher(new Date("2022-01-01"), { $in: [new Date("2022-01-03")] })
  ).toBe(false);
  expect(
    matchesInMatcher(new Date("2022-01-01"), {
      $in: [new Date("2022-01-01"), new Date("2022-01-02")],
    })
  ).toBe(true);
  expect(
    matchesInMatcher(new Date("2022-01-01T00:10:10"), {
      $in: [new Date("2022-01-01T00:10:10")],
    })
  ).toBe(true);
  expect(
    matchesInMatcher(new Date("2022-01-01T00:12:34"), { $in: [new Date("2022-01-01")] })
  ).toBe(false);
  expect(matchesInMatcher(new Date("2022-01-01"), { $in: [] })).toBe(false);
});
