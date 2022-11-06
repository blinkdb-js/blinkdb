import { matchesGte } from "./gte";

it("should work with numbers", () => {
  expect(matchesGte(1, { gte: 2 })).toBe(false);
  expect(matchesGte(2, { gte: 2 })).toBe(true);
  expect(matchesGte(3, { gte: 2 })).toBe(true);
  expect(matchesGte(Number.MAX_SAFE_INTEGER, { gte: 2 })).toBe(true);
  expect(matchesGte(undefined, { gte: 3 })).toBe(false);
  expect(matchesGte(null, { gte: 10 })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesGte("a", { gte: "b" })).toBe(false);
  expect(matchesGte("b", { gte: "b" })).toBe(true);
  expect(matchesGte("c", { gte: "b" })).toBe(true);
  expect(matchesGte("", { gte: "" })).toBe(true);
  expect(matchesGte(undefined, { gte: "b" })).toBe(false);
  expect(matchesGte(null, { gte: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesGte(BigInt(1), { gte: BigInt(2) })).toBe(false);
  expect(matchesGte(BigInt(2), { gte: BigInt(2) })).toBe(true);
  expect(matchesGte(BigInt(3), { gte: BigInt(2) })).toBe(true);
  expect(matchesGte(undefined, { gte: BigInt(3) })).toBe(false);
  expect(matchesGte(null, { gte: BigInt(3) })).toBe(false);
});

it("should work with dates", () => {
  expect(matchesGte(new Date("2022-01-01"), { gte: new Date("2022-01-02") })).toBe(false);
  expect(matchesGte(new Date("2022-01-02"), { gte: new Date("2022-01-02") })).toBe(true);
  expect(matchesGte(new Date("2022-01-03"), { gte: new Date("2022-01-02") })).toBe(true);
  expect(matchesGte(undefined, { gte: new Date("2022-01-02") })).toBe(false);
  expect(matchesGte(null, { gte: new Date("2022-01-02") })).toBe(false);
});

it("should work with null / undefined", () => {
  expect(matchesGte(null, { gte: null })).toBe(true);
  expect(matchesGte(undefined, { gte: undefined })).toBe(false);
});
