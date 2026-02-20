import type { FastifyInstance } from 'fastify';
import { builtinTemplates, extractPlaceholders } from '@bpmn-app/shared';
import { instantiateAndLayoutTemplate } from '../services/bpmn.service.js';

export async function templateRoutes(app: FastifyInstance) {
  // List all available templates
  app.get('/api/templates', async () => {
    return {
      data: builtinTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        formSchema: t.formSchema,
        placeholders: extractPlaceholders(t.bpmnXml),
      })),
    };
  });

  // Get a single template
  app.get<{ Params: { id: string } }>('/api/templates/:id', async (request, reply) => {
    const template = builtinTemplates.find((t) => t.id === request.params.id);
    if (!template) {
      return reply.status(404).send({ code: 'NOT_FOUND', message: 'Template not found' });
    }
    return {
      data: {
        ...template,
        placeholders: extractPlaceholders(template.bpmnXml),
      },
    };
  });

  // Instantiate a template with variables
  app.post<{
    Params: { id: string };
    Body: { variables: Record<string, string> };
  }>('/api/templates/:id/instantiate', async (request, reply) => {
    const { id } = request.params;
    const { variables } = request.body;

    try {
      const xml = await instantiateAndLayoutTemplate(id, variables);
      return { data: { bpmnXml: xml } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Template instantiation failed';
      return reply.status(400).send({ code: 'INSTANTIATION_ERROR', message });
    }
  });
}
