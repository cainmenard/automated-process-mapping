import Fastify from 'fastify';
import cors from '@fastify/cors';
import { templateRoutes } from './routes/templates.js';
import { processMapRoutes } from './routes/process-maps.js';
import { projectRoutes } from './routes/projects.js';
import { clientRoutes } from './routes/clients.js';
import { bpmnRoutes } from './routes/bpmn.js';
import { exportRoutes } from './routes/export.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
});

// CORS for frontend dev server
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
});

// Health check
app.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// Register route modules
await app.register(templateRoutes);
await app.register(bpmnRoutes);
await app.register(clientRoutes);
await app.register(projectRoutes);
await app.register(processMapRoutes);
await app.register(exportRoutes);

// Start server
const port = parseInt(process.env.PORT ?? '3001', 10);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`API server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
