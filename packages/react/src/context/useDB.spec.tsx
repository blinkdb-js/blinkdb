import React from "react";
import { renderHook } from '@testing-library/react';
import { BlinkDbProvider } from "./provider";
import { PropsWithChildren } from "react";
import { useDB } from "./useDB";

const wrapper = ({ children }: PropsWithChildren<{}>) => (
  <BlinkDbProvider model={{}}>{children}</BlinkDbProvider>
);

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
  const { result } = renderHook(() => useDB(), { wrapper });
  expect(result.current).not.toBeNull();
});