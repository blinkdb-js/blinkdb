import React from "react";
import { renderHook } from '@testing-library/react';
import { useDB } from "./useDB";
import { blinkDbWrapper } from "../testutils";

describe('', () => {
  let consoleErrorFn: jest.SpyInstance;
  beforeAll(() => {
    consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(jest.fn);
  });

  test('throws if db is not provided', () => {
    expect(() => renderHook(() => useDB()))
      .toThrowError();
  });

  afterAll(() => {
    consoleErrorFn.mockRestore();
  });
});

test('returns db if defined', () => {
  const { result } = renderHook(() => useDB(), { wrapper: blinkDbWrapper });
  expect(result.current).not.toBeNull();
});