import { matchesGt } from "./gt";

it("should work with numbers", () => {
  expect(matchesGt(1, { gt: 2 })).toBe(false);
  expect(matchesGt(2, { gt: 2 })).toBe(false);
  expect(matchesGt(3, { gt: 2 })).toBe(true);
  expect(matchesGt(Number.MAX_SAFE_INTEGER, { gt: 2 })).toBe(true);
  expect(matchesGt(undefined, { gt: 3 })).toBe(false);
  expect(matchesGt(null, { gt: 10 })).toBe(false);
});

it("should work with strings", () => {
  expect(matchesGt("a", { gt: "b" })).toBe(false);
  expect(matchesGt("b", { gt: "b" })).toBe(false);
  expect(matchesGt("c", { gt: "b" })).toBe(true);
  expect(matchesGt("", { gt: "" })).toBe(false);
  expect(matchesGt(undefined, { gt: "b" })).toBe(false);
  expect(matchesGt(null, { gt: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesGt(BigInt(1), { gt: BigInt(2) })).toBe(false);
  expect(matchesGt(BigInt(2), { gt: BigInt(2) })).toBe(false);
  expect(matchesGt(BigInt(3), { gt: BigInt(2) })).toBe(true);
  expect(matchesGt(undefined, { gt: BigInt(3) })).toBe(false);
  expect(matchesGt(null, { gt: BigInt(3) })).toBe(false);
});

it("should work with dates", () => {
  expect(matchesGt(new Date("2022-01-01"), { gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGt(new Date("2022-01-02"), { gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGt(new Date("2022-01-03"), { gt: new Date("2022-01-02") })).toBe(true);
  expect(matchesGt(undefined, { gt: new Date("2022-01-02") })).toBe(false);
  expect(matchesGt(null, { gt: new Date("2022-01-02") })).toBe(false);
});

it("should work with null / undefined", () => {
  expect(matchesGt(null, { gt: null })).toBe(false);
  expect(matchesGt(undefined, { gt: undefined })).toBe(false);
});
