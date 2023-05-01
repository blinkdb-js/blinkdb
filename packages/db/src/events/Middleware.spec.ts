import { isAction } from "../core/use";
import { User } from "../tests/utils";
import { middleware } from "./Middleware";
import { Hook, HookContext } from "./types";

it("should work without hooks", async () => {
  const context = { params: [] as any } as HookContext<User, "id", "count">;
  const result = middleware([] as Hook<User, "id">[], context, () => 123);

  expect(result).toBe(123);
});

describe("hooks", () => {
  it("should work", async () => {
    const context = { params: [] as any } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [({ next, params }) => next(...params)];
    const result = middleware(hooks, context, () => 123);

    expect(result).toBe(123);
  });

  it("should be able to modify values", async () => {
    const context = {
      action: "count",
      params: [] as any,
    } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next(...ctx.params);
          return num + 1;
        }
        return ctx.next(...ctx.params);
      },
    ];
    const result = await middleware(hooks, context, () => 123);

    expect(result).toBe(124);
  });

  it("should be able to modify parameters", async () => {
    const context = {
      action: "count",
      params: [] as any,
    } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      async (ctx) => {
        if (isAction(ctx, "count")) {
          return ctx.next(null as any, ctx.params[1], ctx.params[2]);
        }
        return ctx.next(...ctx.params);
      },
    ];
    const result = await middleware(hooks, context, (t) => (t === null ? 100 : 0));

    expect(result).toBe(100);
  });

  it("should be able to return new values", async () => {
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [() => 321];
    const result = await middleware(hooks, context, () => 123);

    expect(result).toBe(321);
  });

  it("should be able to throw", async () => {
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      () => {
        throw new Error();
      },
    ];
    const fn = async () => await middleware(hooks, context, () => 123);

    expect(fn).rejects.toThrow();
  });

  it("should not call the implementation if next() isn't called", async () => {
    const fn = jest.fn(() => 123);
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [() => 123];
    const result = await middleware(hooks, context, fn);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("should call the implementation n times if next() is called n times", async () => {
    const fn = jest.fn(() => 123);
    const context = { params: [] as any } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      ({ next, params }) => {
        for (let i = 0; i < 10; i++) {
          next(...params);
        }
        return 321;
      },
    ];
    const result = await middleware(hooks, context, fn);

    expect(fn).toHaveBeenCalledTimes(10);
  });

  it("should work with multiple hooks", async () => {
    const context = {
      action: "count",
      params: [] as any,
    } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next(...ctx.params);
          return num + 100;
        }
        return ctx.next(...ctx.params);
      },
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next(...ctx.params);
          return num + 10;
        }
        return ctx.next(...ctx.params);
      },
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next(...ctx.params);
          return num + 1;
        }
        return ctx.next(...ctx.params);
      },
    ];
    const result = await middleware(hooks, context, () => 123);

    expect(result).toBe(234);
  });

  it("should be called in reverse order", async () => {
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [() => 111, () => 222, () => 333];
    const result = await middleware(hooks, context, () => 123);

    expect(result).toBe(111);
  });
});
