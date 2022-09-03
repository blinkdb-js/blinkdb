import { Dispatcher } from "./Dispatcher";

let dispatcher: Dispatcher<{ num: number }>;
let cbA: jest.Mock;
let cbB: jest.Mock;
let cbC: jest.Mock;

beforeEach(() => {
  dispatcher = new Dispatcher();
  cbA = jest.fn();
  cbB = jest.fn();
  cbC = jest.fn();
});

it("should call all registered callbacks when dispatch() is called", async () => {
  dispatcher.register(cbA);
  dispatcher.register(cbB);
  dispatcher.register(cbC);

  await dispatcher.dispatch({ num: 5 });

  expect(cbA.mock.calls.length).toBe(1);
  expect(cbA.mock.calls[0][0]).toStrictEqual({ num: 5 });
  expect(cbB.mock.calls.length).toBe(1);
  expect(cbB.mock.calls[0][0]).toStrictEqual({ num: 5 });
  expect(cbC.mock.calls.length).toBe(1);
  expect(cbC.mock.calls[0][0]).toStrictEqual({ num: 5 });
});

it("should allow to unregister callbacks", async () => {
  const unregisterCbA = dispatcher.register(cbA);
  unregisterCbA();

  await dispatcher.dispatch({ num: 5 });

  expect(cbA.mock.calls.length).toBe(0);
});