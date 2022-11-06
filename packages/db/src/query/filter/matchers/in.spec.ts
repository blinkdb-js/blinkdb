import { matchesIn } from "./in";

it("should work with numbers", () => {
  expect(matchesIn(1, { in: [2] })).toBe(false);
  expect(matchesIn(2, { in: [2] })).toBe(true);
  expect(matchesIn(0, { in: [1, 2, 3] })).toBe(false);
  expect(
    matchesIn(Number.MAX_SAFE_INTEGER, { in: [10, 100, Number.MAX_SAFE_INTEGER] })
  ).toBe(true);
  expect(matchesIn(3, { in: [] })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesIn("a", { in: ["b"] })).toBe(false);
  expect(matchesIn("b", { in: ["b"] })).toBe(true);
  expect(matchesIn("c", { in: ["a", "b", "d"] })).toBe(false);
  expect(matchesIn("", { in: ["", "z", "zz", "zzz"] })).toBe(true);
  expect(matchesIn("abc", { in: [] })).toBe(false);
});

it("should work with booleans", () => {
  expect(matchesIn(false, { in: [true] })).toBe(false);
  expect(matchesIn(true, { in: [true] })).toBe(true);
  expect(matchesIn(true, { in: [false] })).toBe(false);
  expect(matchesIn(false, { in: [true, false] })).toBe(true);
  expect(matchesIn(false, { in: [] })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesIn(BigInt(1), { in: [BigInt(2), BigInt(3)] })).toBe(false);
  expect(matchesIn(BigInt(2), { in: [BigInt(2), BigInt(3)] })).toBe(true);
  expect(matchesIn(BigInt(0), { in: [BigInt(300)] })).toBe(false);
  expect(matchesIn(BigInt(1000), { in: [] })).toBe(false);
});

it("should work with objects", () => {
  expect(matchesIn({ a: 1 }, { in: [{ a: 2 }] })).toBe(false);
  expect(matchesIn({ b: 2 }, { in: [{ b: 2 }] })).toBe(true);
  expect(matchesIn({ a: 1, b: 2 }, { in: [{ a: 2 }, { c: 3 }, { a: 1, b: 2 }] })).toBe(
    true
  );
  expect(matchesIn({ x: "Hello" }, { in: [{ x: "World" }] })).toBe(false);
  expect(matchesIn({ a: "b" }, { in: [] })).toBe(false);
});

it("should work with arrays", () => {
  expect(matchesIn([1], { in: [[12]] })).toBe(false);
  expect(matchesIn([1], { in: [[1, 2], []] })).toBe(false);
  expect(matchesIn([10, 20], { in: [[10, 20]] })).toBe(true);
  expect(matchesIn([20, 10], { in: [[10, 20]] })).toBe(true);
  expect(matchesIn([1, 2, 3, 4], { in: [] })).toBe(false);
});

it("should work with dates", () => {
  expect(matchesIn(new Date("2022-01-01"), { in: [new Date("2022-01-03")] })).toBe(false);
  expect(
    matchesIn(new Date("2022-01-01"), {
      in: [new Date("2022-01-01"), new Date("2022-01-02")],
    })
  ).toBe(true);
  expect(
    matchesIn(new Date("2022-01-01T00:10:10"), {
      in: [new Date("2022-01-01T00:10:10")],
    })
  ).toBe(true);
  expect(
    matchesIn(new Date("2022-01-01T00:12:34"), { in: [new Date("2022-01-01")] })
  ).toBe(false);
  expect(matchesIn(new Date("2022-01-01"), { in: [] })).toBe(false);
});
