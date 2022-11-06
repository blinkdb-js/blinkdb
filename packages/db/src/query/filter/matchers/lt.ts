import { LtMatcher, OrdProps } from "../../types";

export function matchesLt<T extends OrdProps>(value: T, matcher: LtMatcher<T>): boolean {
  return value! < matcher.lt!;
}
