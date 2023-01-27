import { Middleware } from "./Middleware";
import { HookAction, HookContext, HookParams } from "./types";
import { User } from "../tests/utils";

let middleware: Middleware<User, "id">;

beforeEach(() => {
  middleware = new Middleware();
});

it("should allow registering hooks", () => {
  middleware.register(({ next }) => next());
});

it("should work without hooks", async () => {
  const context = {} as HookContext<User, "id", "count">;
  const result = await middleware.run(context, () => 123);

  expect(result).toBe(123);
});

describe("hooks", () => {
  it("should work", async () => {
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(({ next }) => next());
    const result = await middleware.run(context, () => 123);

    expect(result).toBe(123);
  });

  function isAction<
    T extends object = any,
    P extends keyof T = keyof T,
    A extends HookAction = HookAction
  >(ctx: HookContext<T, P>, action: A): ctx is HookContext<T, P, A> {
    return ctx.action === action;
  }

  it("should be able to modify values", async () => {
    const context = {
      action: "count",
    } as HookContext<User, "id", "count">;

    middleware.register(async (ctx) => {
      if (isAction(ctx, "count")) {
        const num = await ctx.next();
        return num + 1;
      }
    });
    const result = await middleware.run(context, () => 123);

    expect(result).toBe(124);
  });

  it("should be able to return new values", async () => {
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(() => {
      return 321;
    });
    const result = await middleware.run(context, () => 123);

    expect(result).toBe(321);
  });

  it("should be able to throw", async () => {
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(() => {
      throw new Error();
    });
    const fn = async () => await middleware.run(context, () => 123);

    expect(fn).rejects.toThrowError();
  });

  it("should not call the implementation if next() isn't called", async () => {
    const fn = jest.fn(() => 123);
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(() => {
      return 321;
    });
    await middleware.run(context, fn);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("should call the implementation n times if next() is called n times", async () => {
    const fn = jest.fn(() => 123);
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(({ next }) => {
      for (let i = 0; i < 10; i++) {
        next();
      }
      return 321;
    });
    await middleware.run(context, fn);

    expect(fn).toHaveBeenCalledTimes(10);
  });

  it("should work with multiple hooks", async () => {
    const context = {
      action: "count",
    } as HookContext<User, "id", "count">;

    middleware.register(async (ctx) => {
      if (isAction(ctx, "count")) {
        const num = await ctx.next();
        return num + 100;
      }
    });
    middleware.register(async (ctx) => {
      if (isAction(ctx, "count")) {
        const num = await ctx.next();
        return num + 10;
      }
    });
    middleware.register(async (ctx) => {
      if (isAction(ctx, "count")) {
        const num = await ctx.next();
        return num + 1;
      }
    });
    const result = await middleware.run(context, () => 123);

    expect(result).toBe(234);
  });

  it("should be called in reverse order", async () => {
    const context = {} as HookContext<User, "id", "count">;

    middleware.register(() => 111);
    middleware.register(() => 222);
    middleware.register(() => 333);
    const result = await middleware.run(context, () => 123);

    expect(result).toBe(111);
  });
});
