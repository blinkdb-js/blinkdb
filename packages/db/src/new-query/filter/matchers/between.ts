import { BetweenMatcher } from "../../types";

export function matchesBetween<
  T extends number | string | Date | BigInt | null | undefined
>(value: T, matcher: BetweenMatcher<T>): boolean {
  return value! >= matcher.$between[0]! && value! <= matcher.$between[1]!;
}
