import { matchesLte } from "./lte";

it("should work with numbers", () => {
  expect(matchesLte(1, { lte: 2 })).toBe(true);
  expect(matchesLte(2, { lte: 2 })).toBe(true);
  expect(matchesLte(3, { lte: 2 })).toBe(false);
  expect(matchesLte(Number.MAX_SAFE_INTEGER, { lte: 2 })).toBe(false);
  expect(matchesLte(undefined, { lte: 3 })).toBe(false);
  expect(matchesLte(null, { lte: 10 })).toBe(true);
});

it("should work with strings", () => {
  expect(matchesLte("a", { lte: "b" })).toBe(true);
  expect(matchesLte("b", { lte: "b" })).toBe(true);
  expect(matchesLte("c", { lte: "b" })).toBe(false);
  expect(matchesLte("", { lte: "" })).toBe(true);
  expect(matchesLte(undefined, { lte: "b" })).toBe(false);
  expect(matchesLte(null, { lte: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesLte(BigInt(1), { lte: BigInt(2) })).toBe(true);
  expect(matchesLte(BigInt(2), { lte: BigInt(2) })).toBe(true);
  expect(matchesLte(BigInt(3), { lte: BigInt(2) })).toBe(false);
  expect(matchesLte(undefined, { lte: BigInt(3) })).toBe(false);
  expect(matchesLte(null, { lte: BigInt(3) })).toBe(true);
});

it("should work with dates", () => {
  expect(matchesLte(new Date("2022-01-01"), { lte: new Date("2022-01-02") })).toBe(true);
  expect(matchesLte(new Date("2022-01-02"), { lte: new Date("2022-01-02") })).toBe(true);
  expect(matchesLte(new Date("2022-01-03"), { lte: new Date("2022-01-02") })).toBe(false);
  expect(matchesLte(undefined, { lte: new Date("2022-01-02") })).toBe(false);
  expect(matchesLte(null, { lte: new Date("2022-01-02") })).toBe(true);
});

it("should work with null / undefined", () => {
  expect(matchesLte(null, { lte: null })).toBe(true);
  expect(matchesLte(undefined, { lte: undefined })).toBe(false);
});
