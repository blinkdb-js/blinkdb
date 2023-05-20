import React from "react";
import { renderHook } from '@testing-library/react';
import { BlinkDbProvider } from "./provider";
import { PropsWithChildren } from "react";
import { useTable } from "./useTable";
import { BlinkKey, createTable, Database } from "blinkdb";
import { ModelOf } from "./types";

interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  name: string;
}

const model = (db: Database) => ({
  user: createTable<User>(db, "users")(),
  nested: {
    posts: createTable<Post>(db, "posts")()
  }
});

type Model = ModelOf<typeof model>;

const wrapper = ({ children }: PropsWithChildren<{}>) => (
  <BlinkDbProvider model={model}>{children}</BlinkDbProvider>
);

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
    { wrapper }
  );

  expect(result.current).not.toBeNull();
  expect(result.current[BlinkKey].tableName).toBe("users");
});

test('returns a nested table', () => {
  const { result } = renderHook(
    () => useTable((m: Model) => m.nested.posts),
    { wrapper }
  );

  expect(result.current).not.toBeNull();
  expect(result.current[BlinkKey].tableName).toBe("posts");
});