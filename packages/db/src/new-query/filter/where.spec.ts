import { matchesWhere } from "./where";

it("should return true if no matchers exist", () => {
  expect(matchesWhere({ a: 2 }, {})).toBe(true);
});

it("should work if a matcher is given", () => {
  expect(matchesWhere({ a: 3 }, { a: 3 })).toBe(true);
  expect(matchesWhere({ a: 2 }, { a: 3 })).toBe(false);
});

it("should work if multiple matchers are given", () => {
  expect(matchesWhere({ a: 3, b: 3 }, { a: 3, b: { $gte: 3 } })).toBe(true);
  expect(matchesWhere({ a: 3, b: 3 }, { a: 1, b: { $gte: 3 } })).toBe(false);
});
