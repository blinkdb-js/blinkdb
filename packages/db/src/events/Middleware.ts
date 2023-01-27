import { Hook, HookAction, HookContext, HookReturn } from "./types";

export class Middleware<
  T extends object = any,
  P extends keyof T = keyof T,
  A extends HookAction = HookAction
> {
  private hooks: Hook<T, P, A>[] = [];

  public register(hook: Hook<T, P, A>): () => void {
    const index = this.hooks.push(hook);
    return () => this.hooks.splice(index, 1);
  }

  public run(
    context: HookContext<T, P, A>,
    impl: () => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>
  ): HookReturn<T, P, A> | Promise<HookReturn<T, P, A>> {
    return this.next(context, this.hooks, impl);
  }

  private next(
    context: HookContext<T, P, A>,
    hooks: Hook<T, P, A>[],
    impl: () => HookReturn<T, P, A> | Promise<HookReturn<T, P, A>>
  ): HookReturn<T, P, A> | Promise<HookReturn<T, P, A>> {
    const [step, ...next] = hooks;
    return step ? step(() => this.next(context, next, impl), context) : impl();
  }
}
