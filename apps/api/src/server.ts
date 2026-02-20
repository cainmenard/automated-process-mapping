import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authPlugin } from './plugins/auth.js';
import { staticPlugin } from './plugins/static.js';
import { templateRoutes } from './routes/templates.js';
import { processMapRoutes } from './routes/process-maps.js';
import { projectRoutes } from './routes/projects.js';
import { clientRoutes } from './routes/clients.js';
import { bpmnRoutes } from './routes/bpmn.js';
import { exportRoutes } from './routes/export.js';
import { storageRoutes } from './routes/storage.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  // Increase body size limit for large BPMN XML payloads
  bodyLimit: 5 * 1024 * 1024, // 5MB
});

// CORS for frontend dev server
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
});

// Auth plugin (Clerk JWT verification)
await app.register(authPlugin);

// Health check
app.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV ?? 'development',
}));

// Register API route modules
await app.register(templateRoutes);
await app.register(bpmnRoutes);
await app.register(clientRoutes);
await app.register(projectRoutes);
await app.register(processMapRoutes);
await app.register(exportRoutes);
await app.register(storageRoutes);

// Static file serving (production only — serves Vite build output)
await app.register(staticPlugin);

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
