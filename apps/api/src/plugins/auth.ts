import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Authentication plugin using Clerk.
 *
 * In production, this verifies JWT tokens from Clerk's `<SignIn />` flow.
 * In development, it can be bypassed with SKIP_AUTH=true for local testing.
 *
 * Usage: Add `{ preHandler: [app.authenticate] }` to protected routes.
 */
export async function authPlugin(app: FastifyInstance) {
  const skipAuth = process.env.SKIP_AUTH === 'true';

  // Decorate with authenticate handler
  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (skipAuth) {
        // In dev mode without auth, inject a mock user
        (request as any).userId = 'dev-user-001';
        (request as any).orgId = 'dev-org-001';
        return;
      }

      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.slice(7);

      try {
        // Verify with Clerk's backend SDK
        const clerk = await getClerkClient();
        if (!clerk) {
          return reply.status(500).send({
            code: 'AUTH_CONFIG_ERROR',
            message: 'Clerk is not configured',
          });
        }

        const session = await clerk.verifyToken(token);
        (request as any).userId = session.sub;
        (request as any).orgId = session.org_id ?? null;
      } catch (err) {
        return reply.status(401).send({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }
    }
  );
}

/**
 * Lazy-load Clerk backend SDK to avoid hard dependency when not configured.
 */
async function getClerkClient(): Promise<any | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  try {
    const { createClerkClient } = await import('@clerk/fastify');
    return createClerkClient({ secretKey });
  } catch {
    return null;
  }
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
