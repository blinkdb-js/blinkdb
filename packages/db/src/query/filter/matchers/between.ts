import { BetweenMatcher, OrdProps } from "../../types";

export function matchesBetween<T extends OrdProps>(
  value: T,
  matcher: BetweenMatcher<T>
): boolean {
  return value! >= matcher.between[0]! && value! <= matcher.between[1]!;
}
