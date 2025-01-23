/**
 * Parses parameters from a path pattern and an actual path.
 *
 * @template T - A mapping of keys (parameter names) to their respective types.
 * @param pathPattern - The path pattern containing parameter placeholders (e.g., `/users/:userId/roles/:roleId`).
 * @param actualPath - The actual path to parse (e.g., `/users/123/roles/admin`).
 * @returns An object mapping parameter names to their corresponding values, or an empty object if no match is found.
 *
 * @example
 * const params = parseParams<{ userId: string, roleId: string }>(
 *   "/users/:userId/roles/:roleId",
 *   "/users/123/roles/admin"
 * );
 * console.log(params); // { userId: "123", roleId: "admin" }
 */
export function parseParams<T extends Record<string, string>>(pathPattern: string, actualPath: string): T | null {
  const patternSegments = pathPattern.split('/').filter(Boolean);
  const pathSegments = actualPath.split('/').filter(Boolean);

  // Return null if segments do not match in length
  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Partial<T> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    if (patternSegment.startsWith(':')) {
      // Extract the parameter name (e.g., `:userId` becomes `userId`)
      const paramName = patternSegment.slice(1);
      (params as any)[paramName] = pathSegment;
    } else if (patternSegment !== pathSegment) {
      // If non-parameter segments do not match, return null
      return null;
    }
  }

  return params as T;
}
