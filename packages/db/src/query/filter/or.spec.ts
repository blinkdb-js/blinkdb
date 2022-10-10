import { matchesOr } from "./or";

it("should return true if and is empty", () => {
  expect(matchesOr({ a: 1 }, { $or: [] })).toBe(true);
});

it("should work with one filter in and", () => {
  expect(matchesOr({ a: 1 }, { $or: [{ a: 1 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { $or: [{ a: 2 }] })).toBe(false);
  expect(matchesOr({ a: 1, b: 3 }, { $or: [{ b: 4 }] })).toBe(false);
});

it("should work with multiple filters in and", () => {
  expect(matchesOr({ a: 1 }, { $or: [{ a: 1 }, { a: 1 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { $or: [{ a: 1 }, { a: 3 }] })).toBe(true);
  expect(matchesOr({ a: 1 }, { $or: [{ a: 0 }, { a: 3 }] })).toBe(false);
  expect(matchesOr({ b: 3 }, { $or: [{ b: { $gt: 1 } }, { b: { $lt: 10 } }] })).toBe(
    true
  );
});
