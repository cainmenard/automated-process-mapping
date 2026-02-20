import type { FastifyInstance } from 'fastify';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { processMaps, processMapVersions } from '../db/schema.js';
import { validateBpmn } from '../services/bpmn.service.js';
import { stripXmlTags } from '@bpmn-app/shared';

export async function processMapRoutes(app: FastifyInstance) {
  // List process maps for a project
  app.get<{
    Querystring: { projectId: string; page?: string; pageSize?: string; search?: string };
  }>('/api/process-maps', async (request) => {
    const { projectId, page = '1', pageSize = '20', search } = request.query;
    const limit = Math.min(parseInt(pageSize, 10), 100);
    const offset = (parseInt(page, 10) - 1) * limit;

    let query = db
      .select({
        id: processMaps.id,
        projectId: processMaps.projectId,
        name: processMaps.name,
        description: processMaps.description,
        status: processMaps.status,
        templateId: processMaps.templateId,
        ownerId: processMaps.ownerId,
        createdAt: processMaps.createdAt,
        updatedAt: processMaps.updatedAt,
      })
      .from(processMaps)
      .where(
        and(
          eq(processMaps.projectId, projectId),
          isNull(processMaps.deletedAt)
        )
      )
      .orderBy(desc(processMaps.updatedAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    return {
      data: results,
      meta: { page: parseInt(page, 10), pageSize: limit },
    };
  });

  // Get a single process map (with BPMN XML)
  app.get<{ Params: { id: string } }>('/api/process-maps/:id', async (request, reply) => {
    const [map] = await db
      .select()
      .from(processMaps)
      .where(and(eq(processMaps.id, request.params.id), isNull(processMaps.deletedAt)));

    if (!map) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
    }

    return { data: map };
  });

  // Create a new process map
  app.post<{
    Body: {
      projectId: string;
      name: string;
      description?: string;
      bpmnXml: string;
      templateId?: string;
      ownerId: string;
    };
  }>('/api/process-maps', async (request, reply) => {
    const { projectId, name, description, bpmnXml, templateId, ownerId } = request.body;

    // Validate BPMN XML
    const validation = await validateBpmn(bpmnXml);
    if (!validation.valid) {
      return reply.status(400).send({
        code: 'INVALID_BPMN',
        message: 'Invalid BPMN XML',
        details: validation.errors,
      });
    }

    const searchContent = `${name} ${description ?? ''} ${stripXmlTags(bpmnXml)}`;

    const [created] = await db
      .insert(processMaps)
      .values({
        projectId,
        name,
        description,
        bpmnXml,
        templateId,
        ownerId,
        searchContent,
      })
      .returning();

    return reply.status(201).send({ data: created });
  });

  // Update process map (autosave endpoint)
  app.put<{
    Params: { id: string };
    Body: { bpmnXml?: string; name?: string; description?: string; status?: string };
  }>('/api/process-maps/:id', async (request, reply) => {
    const { id } = request.params;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (request.body.bpmnXml !== undefined) {
      updates.bpmnXml = request.body.bpmnXml;
      updates.searchContent = `${request.body.name ?? ''} ${request.body.description ?? ''} ${stripXmlTags(request.body.bpmnXml)}`;
    }
    if (request.body.name !== undefined) updates.name = request.body.name;
    if (request.body.description !== undefined) updates.description = request.body.description;
    if (request.body.status !== undefined) updates.status = request.body.status;

    const [updated] = await db
      .update(processMaps)
      .set(updates)
      .where(eq(processMaps.id, id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
    }

    return { data: updated };
  });

  // Soft-delete a process map
  app.delete<{ Params: { id: string } }>('/api/process-maps/:id', async (request, reply) => {
    const [deleted] = await db
      .update(processMaps)
      .set({ deletedAt: new Date() })
      .where(eq(processMaps.id, request.params.id))
      .returning({ id: processMaps.id });

    if (!deleted) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
    }

    return { data: { id: deleted.id } };
  });

  // ---- Versioning ----

  // Create a named version snapshot
  app.post<{
    Params: { id: string };
    Body: { label?: string; createdById: string };
  }>('/api/process-maps/:id/versions', async (request, reply) => {
    const { id } = request.params;
    const { label, createdById } = request.body;

    // Get current map
    const [map] = await db
      .select()
      .from(processMaps)
      .where(eq(processMaps.id, id));

    if (!map) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
    }

    // Get next version number
    const [maxVersion] = await db
      .select({ max: sql<number>`COALESCE(MAX(${processMapVersions.versionNumber}), 0)` })
      .from(processMapVersions)
      .where(eq(processMapVersions.processMapId, id));

    const nextVersion = (maxVersion?.max ?? 0) + 1;

    const [version] = await db
      .insert(processMapVersions)
      .values({
        processMapId: id,
        versionNumber: nextVersion,
        label,
        bpmnXml: map.bpmnXml,
        createdById,
      })
      .returning();

    return reply.status(201).send({ data: version });
  });

  // List versions for a process map
  app.get<{ Params: { id: string } }>('/api/process-maps/:id/versions', async (request) => {
    const versions = await db
      .select({
        id: processMapVersions.id,
        versionNumber: processMapVersions.versionNumber,
        label: processMapVersions.label,
        createdById: processMapVersions.createdById,
        createdAt: processMapVersions.createdAt,
      })
      .from(processMapVersions)
      .where(eq(processMapVersions.processMapId, request.params.id))
      .orderBy(desc(processMapVersions.versionNumber));

    return { data: versions };
  });

  // Restore a specific version
  app.post<{
    Params: { id: string; versionId: string };
  }>('/api/process-maps/:id/versions/:versionId/restore', async (request, reply) => {
    const { id, versionId } = request.params;

    const [version] = await db
      .select()
      .from(processMapVersions)
      .where(eq(processMapVersions.id, versionId));

    if (!version) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Version not found' });
    }

    const [updated] = await db
      .update(processMaps)
      .set({ bpmnXml: version.bpmnXml, updatedAt: new Date() })
      .where(eq(processMaps.id, id))
      .returning();

    return { data: updated };
  });
}
