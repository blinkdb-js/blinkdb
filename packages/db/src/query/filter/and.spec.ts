import { matchesAnd } from "./and";

it("should return true if and is empty", () => {
  expect(matchesAnd({ a: 1 }, { AND: [] })).toBe(true);
});

it("should work with one filter in and", () => {
  expect(matchesAnd({ a: 1 }, { AND: [{ a: 1 }] })).toBe(true);
  expect(matchesAnd({ a: 1 }, { AND: [{ a: 2 }] })).toBe(false);
  expect(matchesAnd({ a: 1, b: 3 }, { AND: [{ b: 4 }] })).toBe(false);
});

it("should work with multiple filters in and", () => {
  expect(matchesAnd({ a: 1 }, { AND: [{ a: 1 }, { a: 1 }] })).toBe(true);
  expect(matchesAnd({ a: 1 }, { AND: [{ a: 1 }, { a: 3 }] })).toBe(false);
  expect(matchesAnd({ b: 3 }, { AND: [{ b: { gt: 1 } }, { b: { lt: 10 } }] })).toBe(true);
});
