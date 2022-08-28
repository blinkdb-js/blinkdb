/**
 * Compare the performance of two or more functions against each other.
 * Tests each function multiple times and logs the comparison output.
 * 
 * @example
 * compare("logging", {
 *   log: () => console.log("Hi!"),
 *   error: () => console.error("Hello!")
 * });
 * // Will output something like this to the console:
 * //   comparison logging:
 * //     log     took 4ms
 * //     error   took 6ms
 */
export async function compare(name: string, fns: { [name: string]: () => void|Promise<void> }, opts?: CompareOptions): Promise<void> {
  const times = new Map<string, number[]>();
  const fnKeys = Object.keys(fns);
  const fnEntries = Object.entries(fns);
  for(const name of fnKeys) {
    times.set(name, []);
  }

  for(let i = 0; i < (opts?.runs ?? 10000); i++) {
    opts?.beforeEach?.();
    for(const entry of fnEntries) {
      const [name, fn] = entry;
      const startTime = performance.now();
      await fn();
      const endTime = performance.now();
      times.set(name, [...times.get(name)!, endTime - startTime]);
    }
  }

  const lenOfLongestFnName = Object.keys(fns).reduce((a, b) => a.length > b.length ? a : b).length;

  console.log(`comparison for ${name}:`);
  for(const name of fnKeys) {
    const paddedName = name.padEnd(lenOfLongestFnName);
    const timesForName = times.get(name)!;
    const avg = timesForName[timesForName.length / 2];
    const high = timesForName.reduce((a, b) => a > b ? a : b);
    const low = timesForName.reduce((a, b) => a > b ? b : a);
    console.log(`  ${paddedName}   took ${avg.toFixed(5)}ms, high ${high.toFixed(5)}ms, low ${low.toFixed(5)}ms`);
  }
}

export interface CompareOptions {
  /** How many times tests are run. */
  runs?: number;
  beforeEach?: () => void;
}