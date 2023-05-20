import React from "react";
import { renderHook } from '@testing-library/react';
import { useTable } from "./useTable";
import { BlinkKey } from "blinkdb";
import { blinkDbWrapper, Model } from "../testutils";

describe('', () => {
  let consoleErrorFn: jest.SpyInstance;
  beforeAll(() => {
    consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(jest.fn);
  });

  test('throws if model is not provided', () => {
    expect(() => renderHook(() => useTable(null as any)))
      .toThrowError();
  });

  afterAll(() => {
    consoleErrorFn.mockRestore();
  });
});

test('returns a table', () => {
  const { result } = renderHook(
    () => useTable((m: Model) => m.user),
    { wrapper: blinkDbWrapper }
  );

  expect(result.current).not.toBeNull();
  expect(result.current[BlinkKey].tableName).toBe("users");
});

test('returns a nested table', () => {
  const { result } = renderHook(
    () => useTable((m: Model) => m.nested.posts),
    { wrapper: blinkDbWrapper }
  );

  expect(result.current).not.toBeNull();
  expect(result.current[BlinkKey].tableName).toBe("posts");
});