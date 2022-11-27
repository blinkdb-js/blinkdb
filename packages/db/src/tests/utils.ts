/**
 * An interface which can be used as the interface for a BlinkDB table instance.
 */
export interface User {
  id: string;
  name: string;
  age?: number;
}

/**
 * Generates pseudorandom users for usage in tests.
 *
 * The user array returned is the same for all function calls.
 */
export function generateRandomUsers(): User[] {
  const random = createPseudoRandomGen();
  const users: User[] = [];
  for (let id = 0; id < 100; id++) {
    users.push({
      id: `${id}`,
      name: ["Alice", "Bob", "Charlie", "Eve", "George"][id % 5],
      age: [undefined, random() % 100][id % 2],
    });
  }
  return users;
}

/**
 * Creates a function that generates pseudo-random numbers.
 *
 * Copied from https://javascript.info/task/pseudo-random-generator.
 */
function createPseudoRandomGen() {
  let previous = 1337;
  return () => {
    previous = (previous * 16807) % 2147483647;
    return previous;
  };
}
