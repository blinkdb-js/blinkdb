import { matches } from ".";

it("should work with where filter", () => {
  expect(matches({ a: 1 }, { a: 3 })).toBe(false);
  expect(matches({ a: 1 }, { a: 1 })).toBe(true);
  expect(matches({ a: 1 }, { a: { between: [0, 10] } })).toBe(true);
  expect(matches({ a: 100 }, { a: { between: [0, 10] } })).toBe(false);
});

it("should work with and", () => {
  expect(matches({ a: 1 }, { AND: [{ a: 3 }] })).toBe(false);
  expect(matches({ a: 1 }, { AND: [{ a: 1 }, { a: { gt: 0 } }] })).toBe(true);
  expect(matches({ a: 1 }, { AND: [{ a: 2 }, { a: { gt: 0 } }] })).toBe(false);
});

it("should work with or", () => {
  expect(matches({ a: 1 }, { OR: [{ a: 3 }] })).toBe(false);
  expect(matches({ a: 1 }, { OR: [{ a: 1 }, { a: 3 }] })).toBe(true);
  expect(matches({ a: 1 }, { OR: [{ a: 2 }, { a: 3 }] })).toBe(false);
});
