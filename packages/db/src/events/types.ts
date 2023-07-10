import {
  clear,
  insert,
  insertMany,
  many,
  remove,
  removeMany,
  removeWhere,
  Table,
  update,
  updateMany,
  updateWhere,
  upsert,
  upsertMany,
} from "../core";
import { Filter, Query } from "../query/types";
import { Entity, PrimaryKeyOf } from "../types";

export type Hook<
  T extends Entity<T> = any,
  P extends PrimaryKeyOf<T> = PrimaryKeyOf<T>,
  A extends HookAction = HookAction
> = (context: HookContext<T, P, A>) => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>;

export type HookContext<
  T extends Entity<T> = any,
  P extends PrimaryKeyOf<T> = PrimaryKeyOf<T>,
  A extends HookAction = HookAction
> = {
  action: A;
  table: string;
  params: HookParams<T, P, A>;
  next: (
    ...params: HookParams<T, P, A>
  ) => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>;
};

export type HookParams<
  T extends Entity<T> = any,
  P extends PrimaryKeyOf<T> = PrimaryKeyOf<T>,
  A extends HookAction = HookAction
> = Parameters<HookMethods<T, P>[A]>;
export type HookReturn<
  T extends Entity<T> = any,
  P extends PrimaryKeyOf<T> = PrimaryKeyOf<T>,
  A extends HookAction = HookAction
> = Awaited<ReturnType<HookMethods<T, P>[A]>>;

export type HookAction = keyof HookMethods;

export type HookMethods<
  T extends Entity<T> = any,
  P extends PrimaryKeyOf<T> = PrimaryKeyOf<T>
> = {
  clear: typeof clear<T, P>;
  count: (
    table: Table<T, P>,
    filter?: Filter<T>,
    options?: { exact: boolean }
  ) => Promise<number>;
  first: (table: Table<T, P>, queryOrId?: Query<T, P> | T[P]) => Promise<T | null>;
  insert: typeof insert<T, P>;
  insertMany: typeof insertMany<T, P>;
  many: typeof many<T, P>;
  one: (table: Table<T, P>, queryOrId: Query<T, P> | T[P]) => Promise<T>;
  remove: typeof remove<T, P>;
  removeMany: typeof removeMany<T, P>;
  removeWhere: typeof removeWhere<T, P>;
  update: typeof update<T, P>;
  updateMany: typeof updateMany<T, P>;
  updateWhere: typeof updateWhere<T, P>;
  upsert: typeof upsert<T, P>;
  upsertMany: typeof upsertMany<T, P>;
  watch: typeof many<T, P>;
};
