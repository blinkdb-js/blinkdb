import { GtMatcher } from "../../types";

export function matchesGt<T extends number | string | Date | BigInt | null | undefined>(
  value: T,
  matcher: GtMatcher<T>
): boolean {
  return value! > matcher.$gt!;
}
