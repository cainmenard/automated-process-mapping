import type { FastifyInstance } from 'fastify';
import { eq, isNull, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { clients, projects } from '../db/schema.js';

export async function clientRoutes(app: FastifyInstance) {
  // List clients
  app.get('/api/clients', async () => {
    const results = await db
      .select()
      .from(clients)
      .where(isNull(clients.deletedAt))
      .orderBy(desc(clients.updatedAt));

    return { data: results };
  });

  // Create a client
  app.post<{
    Body: { name: string; industry?: string; metadata?: Record<string, unknown> };
  }>('/api/clients', async (request, reply) => {
    const [created] = await db
      .insert(clients)
      .values(request.body)
      .returning();

    return reply.status(201).send({ data: created });
  });

  // Get a client with its projects
  app.get<{ Params: { id: string } }>('/api/clients/:id', async (request, reply) => {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, request.params.id));

    if (!client) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Client not found' });
    }

    const clientProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, client.id));

    return { data: { ...client, projects: clientProjects } };
  });

  // Update a client
  app.put<{
    Params: { id: string };
    Body: { name?: string; industry?: string; metadata?: Record<string, unknown> };
  }>('/api/clients/:id', async (request, reply) => {
    const [updated] = await db
      .update(clients)
      .set({ ...request.body, updatedAt: new Date() })
      .where(eq(clients.id, request.params.id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Client not found' });
    }

    return { data: updated };
  });

  // Soft-delete a client
  app.delete<{ Params: { id: string } }>('/api/clients/:id', async (request, reply) => {
    const [deleted] = await db
      .update(clients)
      .set({ deletedAt: new Date() })
      .where(eq(clients.id, request.params.id))
      .returning({ id: clients.id });

    if (!deleted) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Client not found' });
    }

    return { data: { id: deleted.id } };
  });
}
