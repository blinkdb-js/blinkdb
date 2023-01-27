import { Hook, HookContext, HookReturn } from "./types";

export class Middleware<T extends object = any, P extends keyof T = keyof T> {
  private hooks: Hook<T, P>[] = [];

  public register(hook: Hook<T, P>): () => void {
    const index = this.hooks.push(hook);
    return () => this.hooks.splice(index, 1);
  }

  public run(
    context: Omit<HookContext<T, P>, "next">,
    impl: () => HookReturn<T, P> | Promise<HookReturn<T, P>>
  ): HookReturn<T, P> | Promise<HookReturn<T, P>> {
    return this.next(context, this.hooks, impl);
  }

  private next(
    context: Omit<HookContext<T, P>, "next">,
    hooks: Hook<T, P>[],
    impl: () => HookReturn<T, P> | Promise<HookReturn<T, P>>
  ): HookReturn<T, P> | Promise<HookReturn<T, P>> {
    const [step, ...next] = hooks;
    return step
      ? step({
          ...context,
          next: () => this.next(context, next, impl),
        })
      : impl();
  }
}
