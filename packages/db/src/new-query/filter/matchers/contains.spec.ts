import { matchesContainsMatcher } from "./contains";

it("should work with number arrays", () => {
  expect(matchesContainsMatcher([1], { $contains: 1 })).toBe(true);
  expect(matchesContainsMatcher([1, 2, 3], { $contains: 2 })).toBe(true);
  expect(matchesContainsMatcher([], { $contains: 2 })).toBe(false);
  expect(matchesContainsMatcher([5], { $contains: 2 })).toBe(false);
});

it("should work with string arrays", () => {
  expect(matchesContainsMatcher(["a"], { $contains: "a" })).toBe(true);
  expect(matchesContainsMatcher(["a", "b", "c"], { $contains: "b" })).toBe(true);
  expect(matchesContainsMatcher([], { $contains: "b" })).toBe(false);
  expect(matchesContainsMatcher(["f"], { $contains: "a" })).toBe(false);
});

it("should work with boolean arrays", () => {
  expect(matchesContainsMatcher([true], { $contains: true })).toBe(true);
  expect(matchesContainsMatcher([true, false], { $contains: false })).toBe(true);
  expect(matchesContainsMatcher([], { $contains: false })).toBe(false);
  expect(matchesContainsMatcher([false], { $contains: true })).toBe(false);
});

it("should work with bigint arrays", () => {
  expect(matchesContainsMatcher([BigInt(1)], { $contains: BigInt(1) })).toBe(true);
  expect(
    matchesContainsMatcher([BigInt(1), BigInt(2), BigInt(3)], { $contains: BigInt(2) })
  ).toBe(true);
  expect(matchesContainsMatcher([], { $contains: BigInt(2) })).toBe(false);
  expect(matchesContainsMatcher([BigInt(5)], { $contains: BigInt(2) })).toBe(false);
});

it("should work with object arrays", () => {
  expect(matchesContainsMatcher([{ a: 1 }], { $contains: { a: 1 } })).toBe(true);
  expect(
    matchesContainsMatcher([{ a: 1 }, { b: 2 }, { c: 3 }], { $contains: { b: 2 } })
  ).toBe(true);
  expect(matchesContainsMatcher([], { $contains: { b: 2 } })).toBe(false);
  expect(matchesContainsMatcher([{ a: 3 }], { $contains: { b: 3 } })).toBe(false);
});

it("should work with nested arrays", () => {
  expect(matchesContainsMatcher([[1]], { $contains: [1] })).toBe(true);
  expect(matchesContainsMatcher([[1], [2], [3]], { $contains: [2] })).toBe(true);
  expect(matchesContainsMatcher([], { $contains: [2] })).toBe(false);
  expect(matchesContainsMatcher([[5]], { $contains: [2] })).toBe(false);
});

it("should work with dates", () => {
  expect(
    matchesContainsMatcher([new Date("2022-01-01")], {
      $contains: new Date("2022-01-01"),
    })
  ).toBe(true);
  expect(
    matchesContainsMatcher(
      [new Date("2022-01-01"), new Date("2022-01-02"), new Date("2022-01-03")],
      { $contains: new Date("2022-01-02") }
    )
  ).toBe(true);
  expect(matchesContainsMatcher([], { $contains: new Date("2022-01-02") })).toBe(false);
  expect(
    matchesContainsMatcher([new Date("2022-01-05")], {
      $contains: new Date("2022-01-02"),
    })
  ).toBe(false);
});
