import { matchesOr } from "./or";

it("should return true if and is empty", () => {
  expect(matchesOr({ a: 1 }, { OR: [] })).toBe(true);
});

it("should work with one filter in and", () => {
  expect(matchesOr({ a: 1 }, { OR: [{ a: 1 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { OR: [{ a: 2 }] })).toBe(false);
  expect(matchesOr({ a: 1, b: 3 }, { OR: [{ b: 4 }] })).toBe(false);
});

it("should work with multiple filters in and", () => {
  expect(matchesOr({ a: 1 }, { OR: [{ a: 1 }, { a: 1 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { OR: [{ a: 1 }, { a: 3 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { OR: [{ a: 0 }, { a: 3 }] })).toBe(false);
  expect(matchesOr({ b: 3 }, { OR: [{ b: { gt: 1 } }, { b: { lt: 10 } }] })).toBe(true);
});
