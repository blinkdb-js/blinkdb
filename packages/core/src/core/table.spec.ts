import { createDB, SyncDB } from "./createDB";
import { table } from "./table";

let db: SyncDB;

beforeEach(() => {
    db = createDB();
})

it("should create a table without options", () => {
  table(db, "user");
});

it("should create a table with a different primary key", () => {
  table(db, "user", {
    index: "uuid"
  });
});
