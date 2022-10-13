import { matchesContains } from "./contains";

it("should work with number arrays", () => {
  expect(matchesContains([1], { $contains: 1 })).toBe(true);
  expect(matchesContains([1, 2, 3], { $contains: 2 })).toBe(true);
  expect(matchesContains([], { $contains: 2 })).toBe(false);
  expect(matchesContains([5], { $contains: 2 })).toBe(false);
});

it("should work with string arrays", () => {
  expect(matchesContains(["a"], { $contains: "a" })).toBe(true);
  expect(matchesContains(["a", "b", "c"], { $contains: "b" })).toBe(true);
  expect(matchesContains([], { $contains: "b" })).toBe(false);
  expect(matchesContains(["f"], { $contains: "a" })).toBe(false);
});

it("should work with boolean arrays", () => {
  expect(matchesContains([true], { $contains: true })).toBe(true);
  expect(matchesContains([true, false], { $contains: false })).toBe(true);
  expect(matchesContains([], { $contains: false })).toBe(false);
  expect(matchesContains([false], { $contains: true })).toBe(false);
});

it("should work with bigint arrays", () => {
  expect(matchesContains([BigInt(1)], { $contains: BigInt(1) })).toBe(true);
  expect(
    matchesContains([BigInt(1), BigInt(2), BigInt(3)], { $contains: BigInt(2) })
  ).toBe(true);
  expect(matchesContains([], { $contains: BigInt(2) })).toBe(false);
  expect(matchesContains([BigInt(5)], { $contains: BigInt(2) })).toBe(false);
});

it("should work with object arrays", () => {
  expect(matchesContains([{ a: 1 }], { $contains: { a: 1 } })).toBe(true);
  expect(matchesContains([{ a: 1 }, { b: 2 }, { c: 3 }], { $contains: { b: 2 } })).toBe(
    true
  );
  expect(matchesContains([], { $contains: { b: 2 } })).toBe(false);
  expect(matchesContains([{ a: 3 }], { $contains: { b: 3 } })).toBe(false);
});

it("should work with nested arrays", () => {
  expect(matchesContains([[1]], { $contains: [1] })).toBe(true);
  expect(matchesContains([[10, 20]], { $contains: [10, 20] })).toBe(true);
  expect(matchesContains([[20, 10]], { $contains: [10, 20] })).toBe(true);
  expect(matchesContains([[1], [2], [3]], { $contains: [2] })).toBe(true);
  expect(matchesContains([], { $contains: [2] })).toBe(false);
  expect(matchesContains([[5]], { $contains: [2] })).toBe(false);
});

it("should work with dates", () => {
  expect(
    matchesContains([new Date("2022-01-01")], {
      $contains: new Date("2022-01-01"),
    })
  ).toBe(true);
  expect(
    matchesContains(
      [new Date("2022-01-01"), new Date("2022-01-02"), new Date("2022-01-03")],
      { $contains: new Date("2022-01-02") }
    )
  ).toBe(true);
  expect(matchesContains([], { $contains: new Date("2022-01-02") })).toBe(false);
  expect(
    matchesContains([new Date("2022-01-05")], {
      $contains: new Date("2022-01-02"),
    })
  ).toBe(false);
});
