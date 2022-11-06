import { LteMatcher, OrdProps } from "../../types";

export function matchesLte<T extends OrdProps>(
  value: T,
  matcher: LteMatcher<T>
): boolean {
  return value! <= matcher.lte!;
}
