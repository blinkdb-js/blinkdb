import { GtMatcher } from "../../types";

export function matchesGtMatcher<T extends number | string | Date | BigInt | null | undefined>(
  value: T,
  matcher: GtMatcher<T>
): boolean {
  return value! > matcher.$gt!;
}