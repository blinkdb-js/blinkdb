import { isAction } from "../core/use";
import { User } from "../tests/utils";
import { middleware } from "./Middleware";
import { Hook, HookContext } from "./types";

it("should work without hooks", async () => {
  const context = {} as HookContext<User, "id", "count">;
  const result = middleware([] as Hook<User, "id">[], context, () => 123);

  expect(result).toBe(123);
});

describe("hooks", () => {
  it("should work", async () => {
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [({ next }) => next()];
    const result = middleware(hooks, context, () => 123);

    expect(result).toBe(123);
  });

  it("should be able to modify values", async () => {
    const context = {
      action: "count",
    } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next();
          return num + 1;
        }
        return ctx.next();
      },
    ];
    const result = await middleware(hooks, context, () => 123);

    expect(result).toBe(124);
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

    expect(fn).rejects.toThrowError();
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
    const context = {} as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      ({ next }) => {
        for (let i = 0; i < 10; i++) {
          next();
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
    } as HookContext<User, "id", "count">;

    const hooks: Hook<User, "id">[] = [
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next();
          return num + 100;
        }
        return ctx.next();
      },
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next();
          return num + 10;
        }
        return ctx.next();
      },
      async (ctx) => {
        if (isAction(ctx, "count")) {
          const num = await ctx.next();
          return num + 1;
        }
        return ctx.next();
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
