import { Hook, HookAction, HookContext } from "../events/types";
import { EntityWithPk, PrimaryKeyProps } from "../types";
import { BlinkKey, Database } from "./createDB";
import { Table } from "./createTable";

/**
 * Register a hook for all current and future tables that use this database.
 * Everytime a method like `insert`, `update` or `delete` is called, this hook will be executed.
 *
 * Your hook should call `ctx.next()` to execute the next registered hook.
 *
 * @returns a function that removes the hook when called.
 *
 * @example
 * const db = createDB();
 * // `console.log` every time an item is inserted
 * use(db, (ctx) => {
 *   if(isAction(ctx, "insert") || isAction(ctx, "insertMany")) {
 *     console.log("Inserting items:", ctx.params);
 *   }
 *   return ctx.next();
 * });
 */
export function use<
  T extends EntityWithPk<T> = { [keys: string]: unknown },
  P extends PrimaryKeyProps<T> = any
>(database: Database, hook: Hook<T, P>): () => void;

/**
 * Register a hook for a given table.
 * Everytime a method like `insert`, `update` or `delete` is called on this table, this hook will be executed.
 *
 * Your hook should call `ctx.next()` to execute the next registered hook.
 *
 * @returns a function that removes the hook when called.
 *
 * @example
 * const db = createDB();
 * const userTable = createTable<User>(db, "users")();
 * // Do not update users with ages greater than 150
 * use(userTable, (ctx) => {
 *   if(isAction(ctx, "update")) {
 *     if(ctx.params[1].age && ctx.params[1].age <= 150) {
 *       return ctx.next();
 *     }
 *   }
 *   return ctx.next();
 * });
 */
export function use<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  table: Table<T, P>,
  hook: Hook<T, P>
): () => void;

export function use<T extends EntityWithPk<T>, P extends PrimaryKeyProps<T>>(
  obj: Table<T, P> | Database,
  hook: Hook<T, P>
): () => void {
  const index = obj[BlinkKey].hooks.push(hook);
  return () => obj[BlinkKey].hooks.splice(index, 1);
}

/**
 * Helper method for returns if the hook was called because of a given action.
 * This will also cast the given context so that `ctx.params` & `ctx.next()` are typed correctly.
 *
 * @example
 * const db = createDB();
 * // `console.log` every time an item is inserted
 * use(db, (ctx) => {
 *   if(isAction(ctx, "insert") || isAction(ctx, "insertMany")) {
 *     console.log("Inserting items:", ctx.params);
 *   }
 *   return ctx.next();
 * });
 */
export function isAction<
  T extends EntityWithPk<T> = any,
  P extends PrimaryKeyProps<T> = PrimaryKeyProps<T>,
  A extends HookAction = HookAction
>(ctx: HookContext<T, P>, action: A): ctx is HookContext<T, P, A> {
  return ctx.action === action;
}
