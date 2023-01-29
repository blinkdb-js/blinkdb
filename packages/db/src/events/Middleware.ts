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
  impl: () => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>
): HookReturn<T, P, A> | Promise<HookReturn<T, P, A>> {
  const [step, ...next] = hooks;
  return step
    ? step({
        ...context,
        next: () => executeHooks(context, next, impl),
      })
    : impl();
}
