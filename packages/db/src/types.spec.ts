import { isValidEntity } from "./types";

describe("isValidEntity", () => {
  it("should work with numbers", () => {
    expect(isValidEntity(5)).toBe(true);
    expect(isValidEntity({ a: 5 })).toBe(true);
  });

  it("should work with strings", () => {
    expect(isValidEntity("abc")).toBe(true);
    expect(isValidEntity({ a: "abc" })).toBe(true);
  });

  it("should work with Dates", () => {
    expect(isValidEntity(new Date())).toBe(true);
    expect(isValidEntity({ a: new Date() })).toBe(true);
  });

  it("should work with BigInts", () => {
    expect(isValidEntity(BigInt(123))).toBe(true);
    expect(isValidEntity({ a: BigInt(123) })).toBe(true);
  });

  it("should not work with Symbols", () => {
    expect(isValidEntity(Symbol("hi"))).toBe(false);
    expect(isValidEntity({ a: Symbol("hi") })).toBe(false);
  });

  it("should not work with functions", () => {
    expect(isValidEntity(() => {})).toBe(false);
    expect(isValidEntity({ a: () => {} })).toBe(false);
  });

  it("should work with objects", () => {
    expect(
      isValidEntity({
        a: {
          e: new Date(),
          b: {
            c: {
              d: Symbol(),
            },
          },
        },
      })
    ).toBe(false);
  });
});
