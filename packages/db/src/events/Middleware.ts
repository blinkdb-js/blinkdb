import { BlinkKey, Table } from "../core";
import { Hook, HookAction, HookContext, HookReturn } from "./types";

/**
 * Execute all hooks.
 *
 * @param context the context to supply to the hooks.
 * @param hooks the list of hooks to execute. The first item in the list will be executed first.
 * @param impl the implementation that will be called if the last hook calls `next()`.
 */
export function executeHooks<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
>(
  context: Omit<HookContext<T, P, A>, "next">,
  hooks: Hook<T, P, A>[],
  impl: () => HookReturn<T, P, A> | Awaited<HookReturn<T, P, A>>
): HookReturn<T, P, A> | Awaited<HookReturn<T, P, A>> {
  const [step, ...next] = hooks;
  return step
    ? step({
        ...context,
        next: () => executeHooks(context, next, impl),
      })
    : impl();
}

/**
 * Execute all hooks for a given table (and its database).
 * Hooks will be loaded from the database of the table + the table itself.
 *
 * @param table the table to execute hooks for.
 * @param context the context to supply to the hooks.
 * @param impl the implementation that will be called if the last hook calls `next()`.
 */
export function executeTableHooks<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
>(
  table: Table<T, P>,
  context: Omit<Parameters<typeof executeHooks<T, P, A>>[0], "table">,
  impl: Parameters<typeof executeHooks<T, P, A>>[2]
): ReturnType<typeof executeHooks<T, P, A>> {
  const dbHooks = table[BlinkKey].db[BlinkKey].hooks;
  const tableHooks = table[BlinkKey].hooks;

  return executeHooks(
    {
      ...context,
      table: table[BlinkKey].tableName,
    },
    [...dbHooks, ...tableHooks],
    impl
  );
}
