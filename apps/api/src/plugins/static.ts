import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'font/ttf',
};

/**
 * Serves the Vite-built frontend in production.
 * In development, Vite's dev server handles this via the proxy config.
 *
 * SPA fallback: any non-API route that doesn't match a static file
 * returns index.html so client-side routing works.
 */
export async function staticPlugin(app: FastifyInstance) {
  if (process.env.NODE_ENV !== 'production') return;

  const distPath = join(process.cwd(), 'apps', 'web', 'dist');

  if (!existsSync(distPath)) {
    app.log.warn(`Static files not found at ${distPath} — skipping static serving`);
    return;
  }

  // Serve static assets from /assets/*
  app.get('/assets/*', async (request, reply) => {
    const urlPath = (request.url).replace(/\?.*$/, '');
    const filePath = join(distPath, urlPath);

    try {
      const content = await readFile(filePath);
      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

      return reply
        .header('Content-Type', contentType)
        .header('Cache-Control', 'public, max-age=31536000, immutable')
        .send(content);
    } catch {
      return reply.status(404).send('Not found');
    }
  });

  // Serve favicon and other root static files
  app.get('/favicon.svg', async (_request, reply) => {
    try {
      const content = await readFile(join(distPath, 'favicon.svg'));
      return reply.header('Content-Type', 'image/svg+xml').send(content);
    } catch {
      return reply.status(404).send('Not found');
    }
  });

  // SPA fallback — serve index.html for all non-API routes
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.status(404).send({
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      });
    }

    try {
      const content = await readFile(join(distPath, 'index.html'), 'utf-8');
      return reply
        .header('Content-Type', 'text/html')
        .header('Cache-Control', 'no-cache')
        .send(content);
    } catch {
      return reply.status(500).send('Server error');
    }
  });
}
