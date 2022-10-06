import { matchesBetweenMatcher } from "./between";

it("should work with numbers", () => {
  expect(matchesBetweenMatcher(1, { $between: [2, 5] })).toBe(false);
  expect(matchesBetweenMatcher(2, { $between: [-10, 1] })).toBe(false);
  expect(matchesBetweenMatcher(3, { $between: [0, 5] })).toBe(true);
  expect(
    matchesBetweenMatcher(Number.MAX_SAFE_INTEGER, {
      $between: [0, Number.MAX_SAFE_INTEGER],
    })
  ).toBe(true);
  expect(matchesBetweenMatcher(undefined, { $between: [0, 1] })).toBe(false);
  expect(matchesBetweenMatcher(null, { $between: [10, 100] })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesBetweenMatcher("a", { $between: ["b", "c"] })).toBe(false);
  expect(matchesBetweenMatcher("b", { $between: ["c", "z"] })).toBe(false);
  expect(matchesBetweenMatcher("c", { $between: ["a", "z"] })).toBe(true);
  expect(matchesBetweenMatcher("", { $between: ["a", "z"] })).toBe(false);
  expect(matchesBetweenMatcher(undefined, { $between: ["b", "c"] })).toBe(false);
  expect(matchesBetweenMatcher(null, { $between: ["", "c"] })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesBetweenMatcher(BigInt(0), { $between: [BigInt(1), BigInt(2)] })).toBe(
    false
  );
  expect(matchesBetweenMatcher(BigInt(1), { $between: [BigInt(1), BigInt(2)] })).toBe(
    true
  );
  expect(matchesBetweenMatcher(BigInt(2), { $between: [BigInt(1), BigInt(2)] })).toBe(
    true
  );
  expect(matchesBetweenMatcher(BigInt(3), { $between: [BigInt(1), BigInt(2)] })).toBe(
    false
  );
  expect(matchesBetweenMatcher(undefined, { $between: [BigInt(1), BigInt(2)] })).toBe(
    false
  );
  expect(matchesBetweenMatcher(null, { $between: [BigInt(1), BigInt(2)] })).toBe(false);
});

it("should work with dates", () => {
  expect(
    matchesBetweenMatcher(new Date("2022-01-01"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetweenMatcher(new Date("2022-01-02"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(true);
  expect(
    matchesBetweenMatcher(new Date("2022-01-03"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(true);
  expect(
    matchesBetweenMatcher(new Date("2022-01-01"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetweenMatcher(undefined, {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetweenMatcher(null, {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
});
