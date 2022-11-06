import { matchesSubWhere } from "./sub";

it("should work", () => {
  expect(matchesSubWhere({ a: { b: 1 } }, { where: { a: { where: { b: 1 } } } })).toBe(
    true
  );
  expect(matchesSubWhere({ a: { b: 1 } }, { where: { a: { where: { b: 2 } } } })).toBe(
    false
  );
  expect(
    matchesSubWhere({ a: { b: 10 } }, { where: { a: { where: { b: { gt: 2 } } } } })
  ).toBe(true);
});

it("should do deep comparisons", () => {
  expect(
    matchesSubWhere(
      { a: { b: { c: { d: 5 } } } },
      {
        where: {
          a: {
            where: {
              b: {
                where: {
                  c: {
                    where: {
                      d: {
                        between: [5, 10],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }
    )
  ).toBe(true);
});
