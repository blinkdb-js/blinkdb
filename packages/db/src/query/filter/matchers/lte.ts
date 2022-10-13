import { LteMatcher } from "../../types";

export function matchesLte<T extends number | string | Date | BigInt | null | undefined>(
  value: T,
  matcher: LteMatcher<T>
): boolean {
  return value! <= matcher.$lte!;
}
