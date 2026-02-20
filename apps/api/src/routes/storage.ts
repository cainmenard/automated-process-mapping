import type { FastifyInstance } from 'fastify';
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  isStorageConfigured,
} from '../services/storage.service.js';
import { v4 as uuidv4 } from 'uuid';

export async function storageRoutes(app: FastifyInstance) {
  // Check if storage is available
  app.get('/api/storage/status', async () => ({
    data: { configured: isStorageConfigured() },
  }));

  // Get a presigned upload URL (e.g., for company logos)
  app.post<{
    Body: { filename: string; contentType: string };
  }>('/api/storage/upload-url', async (request, reply) => {
    if (!isStorageConfigured()) {
      return reply.status(503).send({
        code: 'STORAGE_NOT_CONFIGURED',
        message: 'File storage is not configured',
      });
    }

    const { filename, contentType } = request.body;
    const ext = filename.split('.').pop() ?? '';
    const key = `uploads/${uuidv4()}.${ext}`;

    const url = await getPresignedUploadUrl(key, contentType);
    return { data: { uploadUrl: url, key } };
  });

  // Get a presigned download URL for an exported file
  app.post<{
    Body: { key: string };
  }>('/api/storage/download-url', async (request, reply) => {
    if (!isStorageConfigured()) {
      return reply.status(503).send({
        code: 'STORAGE_NOT_CONFIGURED',
        message: 'File storage is not configured',
      });
    }

    const url = await getPresignedDownloadUrl(request.body.key);
    return { data: { downloadUrl: url } };
  });
}
