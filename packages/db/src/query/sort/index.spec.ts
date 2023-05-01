import { insertIntoSortedList, sortWithSortQuery } from "./index";
import { Sort } from "../types";

describe("sortWithSortQuery", () => {
  it("should sort in ascending order", () => {
    const list = [{ a: 1 }, { a: 2 }, { a: 0 }];

    expect(list.sort(sortWithSortQuery<typeof list[0]>({ key: "a", order: "asc" })))
      .toStrictEqual([{ a: 0 }, { a: 1 }, { a: 2 }]);
  });

  it("should sort in descending order", () => {
    const list = [{ a: 1 }, { a: 2 }, { a: 0 }];

    expect(list.sort(sortWithSortQuery<typeof list[0]>({ key: "a", order: "desc" })))
      .toStrictEqual([{ a: 2 }, { a: 1 }, { a: 0 }]);
  });
});

describe("insertIntoSortedList", () => {
  describe("sorted in ascending order", () => {
    it("should insert into beginning of list", () => {
      const list = [{ a: 1 }, { a: 2 }, { a: 3 }];
      const sort: Sort<typeof list[0]> = { key: "a", order: "asc" };
      insertIntoSortedList(list, { a: 0 }, sort);

      expect(list)
        .toStrictEqual([{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }])
    });

    it("should insert into middle of list", () => {
      const list = [{ a: 0 }, { a: 1 }, { a: 3 }];
      const sort: Sort<typeof list[0]> = { key: "a", order: "asc" };
      insertIntoSortedList(list, { a: 2 }, sort);

      expect(list)
        .toStrictEqual([{ a: 0 }, { a: 1 }, { a: 2 }, { a: 3 }])
    });

    it("should insert into end of list", () => {
      const list = [{ a: 0 }, { a: 1 }, { a: 3 }];
      const sort: Sort<typeof list[0]> = { key: "a", order: "asc" };
      insertIntoSortedList(list, { a: 10 }, sort);

      expect(list)
        .toStrictEqual([{ a: 0 }, { a: 1 }, { a: 3 }, { a: 10 }])
    });
  });

  describe("sort in descending order", () => {
    it("should insert into list correctly", () => {
      const list = [{ a: 3 }, { a: 2 }, { a: 1 }];
      const sort: Sort<typeof list[0]> = { key: "a", order: "desc" };
      insertIntoSortedList(list, { a: 0 }, sort);

      expect(list)
        .toStrictEqual([{ a: 3 }, { a: 2 }, { a: 1 }, { a: 0 }])
    });
  });
});