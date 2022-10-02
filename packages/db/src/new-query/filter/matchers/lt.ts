import { LtMatcher } from "../../types";

export function matchesLtMatcher<T extends number | string | Date | BigInt | null | undefined>(
  value: T,
  matcher: LtMatcher<T>
): boolean {
  return value! < matcher.$lt!;
}