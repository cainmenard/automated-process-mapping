import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { processMaps } from '../db/schema.js';
import { exportToPdf, exportToSvg } from '../services/export.service.js';
import type { ExportOptions } from '@bpmn-app/shared';

export async function exportRoutes(app: FastifyInstance) {
  // Export a process map to PDF
  app.post<{
    Params: { id: string };
    Body: Partial<ExportOptions>;
  }>('/api/process-maps/:id/export/pdf', async (request, reply) => {
    const [map] = await db
      .select()
      .from(processMaps)
      .where(eq(processMaps.id, request.params.id));

    if (!map) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
    }

    const options: ExportOptions = {
      format: 'pdf',
      orientation: 'landscape',
      paperSize: 'A3',
      ...request.body,
    };

    try {
      const result = await exportToPdf(map.bpmnXml, options);
      return reply
        .header('Content-Type', result.contentType)
        .header('Content-Disposition', `attachment; filename="${result.filename}"`)
        .send(result.buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      return reply.status(500).send({ code: 'EXPORT_ERROR', message });
    }
  });

  // Export a process map to SVG
  app.post<{ Params: { id: string } }>(
    '/api/process-maps/:id/export/svg',
    async (request, reply) => {
      const [map] = await db
        .select()
        .from(processMaps)
        .where(eq(processMaps.id, request.params.id));

      if (!map) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: 'Process map not found' });
      }

      try {
        const result = await exportToSvg(map.bpmnXml);
        return reply
          .header('Content-Type', result.contentType)
          .header('Content-Disposition', `attachment; filename="${result.filename}"`)
          .send(result.buffer);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        return reply.status(500).send({ code: 'EXPORT_ERROR', message });
      }
    }
  );

  // Export from raw BPMN XML (for preview / form-generated diagrams not yet saved)
  app.post<{
    Body: { bpmnXml: string; options?: Partial<ExportOptions> };
  }>('/api/export/pdf', async (request, reply) => {
    const { bpmnXml, options: userOptions } = request.body;

    const options: ExportOptions = {
      format: 'pdf',
      orientation: 'landscape',
      paperSize: 'A3',
      ...userOptions,
    };

    try {
      const result = await exportToPdf(bpmnXml, options);
      return reply
        .header('Content-Type', result.contentType)
        .header('Content-Disposition', `attachment; filename="${result.filename}"`)
        .send(result.buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      return reply.status(500).send({ code: 'EXPORT_ERROR', message });
    }
  });
}
