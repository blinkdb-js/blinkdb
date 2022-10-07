import { matchesSubWhereMatcher } from "./sub";

it("should work", () => {
  expect(matchesSubWhereMatcher({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
  expect(matchesSubWhereMatcher({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  expect(matchesSubWhereMatcher({ a: { b: 10 } }, { a: { b: { $gt: 2 } } })).toBe(true);
});

it("should do deep comparisons", () => {
  expect(
    matchesSubWhereMatcher(
      { a: { b: { c: { d: 5 } } } },
      { a: { b: { c: { d: { $between: [5, 10] } } } } }
    )
  ).toBe(true);
});
