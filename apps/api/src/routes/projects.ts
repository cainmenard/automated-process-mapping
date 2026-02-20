import type { FastifyInstance } from 'fastify';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projects } from '../db/schema.js';

export async function projectRoutes(app: FastifyInstance) {
  // List projects for a client
  app.get<{
    Querystring: { clientId: string };
  }>('/api/projects', async (request) => {
    const results = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.clientId, request.query.clientId),
          isNull(projects.deletedAt)
        )
      )
      .orderBy(desc(projects.updatedAt));

    return { data: results };
  });

  // Create a project
  app.post<{
    Body: {
      clientId: string;
      name: string;
      description?: string;
      metadata?: Record<string, unknown>;
    };
  }>('/api/projects', async (request, reply) => {
    const [created] = await db
      .insert(projects)
      .values(request.body)
      .returning();

    return reply.status(201).send({ data: created });
  });

  // Get a project
  app.get<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, request.params.id), isNull(projects.deletedAt)));

    if (!project) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    return { data: project };
  });

  // Update a project
  app.put<{
    Params: { id: string };
    Body: { name?: string; description?: string; status?: string; metadata?: Record<string, unknown> };
  }>('/api/projects/:id', async (request, reply) => {
    const [updated] = await db
      .update(projects)
      .set({ ...request.body, updatedAt: new Date() } as any)
      .where(eq(projects.id, request.params.id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    return { data: updated };
  });

  // Soft-delete a project
  app.delete<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
    const [deleted] = await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, request.params.id))
      .returning({ id: projects.id });

    if (!deleted) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Project not found' });
    }

    return { data: { id: deleted.id } };
  });
}
