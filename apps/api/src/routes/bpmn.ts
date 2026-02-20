import type { FastifyInstance } from 'fastify';
import type { BpmnGenerationInput } from '@bpmn-app/shared';
import {
  generateAndLayoutBpmn,
  autoLayoutBpmn,
  validateBpmn,
} from '../services/bpmn.service.js';

export async function bpmnRoutes(app: FastifyInstance) {
  // Generate BPMN from form data
  app.post<{ Body: BpmnGenerationInput }>('/api/bpmn/generate', async (request, reply) => {
    try {
      const xml = await generateAndLayoutBpmn(request.body);
      return { data: { bpmnXml: xml } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'BPMN generation failed';
      return reply.status(400).send({ code: 'GENERATION_ERROR', message });
    }
  });

  // Auto-layout existing BPMN XML
  app.post<{ Body: { bpmnXml: string } }>('/api/bpmn/layout', async (request, reply) => {
    try {
      const xml = await autoLayoutBpmn(request.body.bpmnXml);
      return { data: { bpmnXml: xml } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Layout failed';
      return reply.status(400).send({ code: 'LAYOUT_ERROR', message });
    }
  });

  // Validate BPMN XML
  app.post<{ Body: { bpmnXml: string } }>('/api/bpmn/validate', async (request, reply) => {
    const result = await validateBpmn(request.body.bpmnXml);
    return { data: result };
  });
}
