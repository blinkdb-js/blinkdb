import { createDB, SyncDB } from "./createDB";
import { table } from "./table";

interface User1 {
  id: string;
  name: string;
}

interface User2 {
  uuid: string;
  age: number;
}

let db: SyncDB;

beforeEach(() => {
  db = createDB();
});

it("should create a table without options", () => {
  table<User1>(db, "user")();
});

it("should create a table with a different primary key", () => {
  table<User1>(
    db,
    "user"
  )({
    primary: "name",
  });
  table<User2>(
    db,
    "user"
  )({
    primary: "uuid",
  });
  table<User2>(
    db,
    "user"
  )({
    primary: "age",
  });
});
