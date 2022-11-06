import { GteMatcher, OrdProps } from "../../types";

export function matchesGte<T extends OrdProps>(
  value: T,
  matcher: GteMatcher<T>
): boolean {
  return value! >= matcher.gte!;
}
