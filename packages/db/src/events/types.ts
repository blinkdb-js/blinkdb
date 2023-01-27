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
  update,
  updateMany,
  updateWhere,
  watch,
} from "../core";
import { count } from "../core/count";

export type Hook<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = (
  next: () => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>,
  context: HookContext<T, P, A>
) => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>;

export type HookContext<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> = {
  action: A;
  table: string;
  params: HookParams<T, P, A>;
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
> = Awaited<ReturnType<HookMethods<T, P>[A]>>;

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
  count: typeof count<T, P>;
  first: typeof first<T, P>;
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
