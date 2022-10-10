import { matchesBetween } from "./between";

it("should work with numbers", () => {
  expect(matchesBetween(1, { $between: [2, 5] })).toBe(false);
  expect(matchesBetween(2, { $between: [-10, 1] })).toBe(false);
  expect(matchesBetween(3, { $between: [0, 5] })).toBe(true);
  expect(
    matchesBetween(Number.MAX_SAFE_INTEGER, {
      $between: [0, Number.MAX_SAFE_INTEGER],
    })
  ).toBe(true);
  expect(matchesBetween(undefined, { $between: [0, 1] })).toBe(false);
  expect(matchesBetween(null, { $between: [10, 100] })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesBetween("a", { $between: ["b", "c"] })).toBe(false);
  expect(matchesBetween("b", { $between: ["c", "z"] })).toBe(false);
  expect(matchesBetween("c", { $between: ["a", "z"] })).toBe(true);
  expect(matchesBetween("", { $between: ["a", "z"] })).toBe(false);
  expect(matchesBetween(undefined, { $between: ["b", "c"] })).toBe(false);
  expect(matchesBetween(null, { $between: ["", "c"] })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesBetween(BigInt(0), { $between: [BigInt(1), BigInt(2)] })).toBe(false);
  expect(matchesBetween(BigInt(1), { $between: [BigInt(1), BigInt(2)] })).toBe(true);
  expect(matchesBetween(BigInt(2), { $between: [BigInt(1), BigInt(2)] })).toBe(true);
  expect(matchesBetween(BigInt(3), { $between: [BigInt(1), BigInt(2)] })).toBe(false);
  expect(matchesBetween(undefined, { $between: [BigInt(1), BigInt(2)] })).toBe(false);
  expect(matchesBetween(null, { $between: [BigInt(1), BigInt(2)] })).toBe(false);
});

it("should work with dates", () => {
  expect(
    matchesBetween(new Date("2022-01-01"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetween(new Date("2022-01-02"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(true);
  expect(
    matchesBetween(new Date("2022-01-03"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(true);
  expect(
    matchesBetween(new Date("2022-01-01"), {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetween(undefined, {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
  expect(
    matchesBetween(null, {
      $between: [new Date("2022-01-02"), new Date("2022-01-03")],
    })
  ).toBe(false);
});
