// Helper to build JSON responses.

/**
 * Return a JSON response with the given payload and status code.
 *
 * @param payload The object to serialise as JSON.
 * @param status The HTTP status code to return. Defaults to 200.
 */
export function jsonResponse(payload: any, status: number = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}