import React from "react";
import { renderHook } from '@testing-library/react';
import { BlinkDbProvider, BlinkDbProviderProps } from "./provider";
import { PropsWithChildren, useContext } from "react";
import { DbContext, ModelContext } from "./context";
import { BlinkKey, createDB, createTable } from "blinkdb";

const wrapper = (db: BlinkDbProviderProps<any>["db"], model: BlinkDbProviderProps<any>["model"]) => {
  return ({ children }: PropsWithChildren<{}>) => (
    <BlinkDbProvider db={db} model={model}>{children}</BlinkDbProvider>
  )
};

describe("db", () => {
  test('returns even if not defined', () => {
    const { result } = renderHook(() => useContext(DbContext), {
      wrapper: wrapper(undefined, {})
    })
    expect(result.current).not.toBeNull();
    expect(result.current?.[BlinkKey].options.clone).toBe(true);
  });

  test('returns if defined', () => {
    const { result } = renderHook(() => useContext(DbContext), {
      wrapper: wrapper(createDB({ clone: false }), {})
    })
    expect(result.current).not.toBeNull();
    expect(result.current?.[BlinkKey].options.clone).toBe(false);
  });

  test('returns if defined as function', () => {
    const { result } = renderHook(() => useContext(DbContext), {
      wrapper: wrapper(() => createDB({ clone: false }), {})
    })
    expect(result.current).not.toBeNull();
    expect(result.current?.[BlinkKey].options.clone).toBe(false);
  });
});

describe("model", () => {
  test('returns if defined', () => {
    const db = createDB({ clone: false });
    const { result } = renderHook(() => useContext(ModelContext), {
      wrapper: wrapper(db, { users: createTable(db, "users")() })
    })
    expect(result.current).not.toBeNull();
    expect(result.current).toHaveProperty("users");
  });
});