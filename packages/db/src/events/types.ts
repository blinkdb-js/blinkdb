import {
  clear,
  first,
  insert,
  insertMany,
  many,
  one,
  remove,
  removeMany,
  removeWhere,
  Table,
  update,
  updateMany,
  updateWhere,
  watch,
} from "../core";
import { Filter, Query } from "../query/types";

export type Hook<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = (context: HookContext<T, P, A>) => HookReturn<T, P, A> | Awaited<HookReturn<T, P, A>>;

export type HookContext<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = {
  action: A;
  table: string;
  params: HookParams<T, P, A>;
  next: () => HookReturn<T, P, A> | Awaited<HookReturn<T, P, A>>;
};

export type HookParams<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = Parameters<HookMethods<T, P>[A]>;
export type HookReturn<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = ReturnType<HookMethods<T, P>[A]>;

export type HookAction =
  | "clear"
  | "count"
  | "first"
  | "insert"
  | "insertMany"
  | "many"
  | "one"
  | "remove"
  | "removeMany"
  | "removeWhere"
  | "update"
  | "updateMany"
  | "updateWhere"
  | "watch";

export type HookMethods<T extends object = any, P extends keyof T = keyof T> = {
  clear: typeof clear<T, P>;
  count: (
    table: Table<T, P>,
    filter?: Filter<T>,
    options?: { exact: boolean }
  ) => Promise<number>;
  first: (table: Table<T, P>, query?: Query<T, P>) => Promise<T | null>;
  insert: typeof insert<T, P>;
  insertMany: typeof insertMany<T, P>;
  many: typeof many<T, P>;
  one: typeof one<T, P>;
  remove: typeof remove<T, P>;
  removeMany: typeof removeMany<T, P>;
  removeWhere: typeof removeWhere<T, P>;
  update: typeof update<T, P>;
  updateMany: typeof updateMany<T, P>;
  updateWhere: typeof updateWhere<T, P>;
  watch: typeof watch<T, P>;
};
