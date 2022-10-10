import { matchesLt } from "./lt";

it("should work with numbers", () => {
  expect(matchesLt(1, { $lt: 2 })).toBe(true);
  expect(matchesLt(2, { $lt: 2 })).toBe(false);
  expect(matchesLt(3, { $lt: 2 })).toBe(false);
  expect(matchesLt(Number.MAX_SAFE_INTEGER, { $lt: 2 })).toBe(false);
  expect(matchesLt(undefined, { $lt: 3 })).toBe(false);
  expect(matchesLt(null, { $lt: 10 })).toBe(true);
});

it("should work with strings", () => {
  expect(matchesLt("a", { $lt: "b" })).toBe(true);
  expect(matchesLt("b", { $lt: "b" })).toBe(false);
  expect(matchesLt("c", { $lt: "b" })).toBe(false);
  expect(matchesLt("", { $lt: "" })).toBe(false);
  expect(matchesLt(undefined, { $lt: "b" })).toBe(false);
  expect(matchesLt(null, { $lt: "z" })).toBe(false);
});

it("should work with bigints", () => {
  expect(matchesLt(BigInt(1), { $lt: BigInt(2) })).toBe(true);
  expect(matchesLt(BigInt(2), { $lt: BigInt(2) })).toBe(false);
  expect(matchesLt(BigInt(3), { $lt: BigInt(2) })).toBe(false);
  expect(matchesLt(undefined, { $lt: BigInt(3) })).toBe(false);
  expect(matchesLt(null, { $lt: BigInt(3) })).toBe(true);
});

it("should work with dates", () => {
  expect(matchesLt(new Date("2022-01-01"), { $lt: new Date("2022-01-02") })).toBe(true);
  expect(matchesLt(new Date("2022-01-02"), { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLt(new Date("2022-01-03"), { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLt(undefined, { $lt: new Date("2022-01-02") })).toBe(false);
  expect(matchesLt(null, { $lt: new Date("2022-01-02") })).toBe(true);
});

it("should work with null / undefined", () => {
  expect(matchesLt(null, { $lt: null })).toBe(false);
  expect(matchesLt(undefined, { $lt: undefined })).toBe(false);
});
