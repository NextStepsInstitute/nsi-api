// Simple CORS helper for Next.js API routes.
//
// Each API route should call `handleOptions` to respond to preflight requests
// and wrap its final response using `applyCors` to attach the appropriate
// Access‑Control headers based on the `ALLOWED_ORIGINS` environment variable.

/**
 * Respond to an OPTIONS preflight request.
 */
export function handleOptions(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim());
  const origin = req.headers.get('origin') || '';
  const headers = new Headers();
  if (!allowedOrigins || allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status: 200, headers });
}

/**
 * Attach CORS headers to an existing response.
 */
export function applyCors(req: Request, res: Response): Response {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim());
  const origin = req.headers.get('origin') || '';
  const headers = new Headers(res.headers);
  if (!allowedOrigins || allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}