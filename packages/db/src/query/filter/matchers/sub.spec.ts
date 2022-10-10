import { matchesSubWhere } from "./sub";

it("should work", () => {
  expect(matchesSubWhere({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
  expect(matchesSubWhere({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  expect(matchesSubWhere({ a: { b: 10 } }, { a: { b: { $gt: 2 } } })).toBe(true);
});

it("should do deep comparisons", () => {
  expect(
    matchesSubWhere(
      { a: { b: { c: { d: 5 } } } },
      { a: { b: { c: { d: { $between: [5, 10] } } } } }
    )
  ).toBe(true);
});
