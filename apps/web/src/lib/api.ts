const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  // Handle binary responses (PDF, images)
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/pdf') || contentType.includes('image/')) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

// ---- Templates ----

export function fetchTemplates() {
  return request<{ data: any[] }>('/templates');
}

export function fetchTemplate(id: string) {
  return request<{ data: any }>(`/templates/${id}`);
}

export function instantiateTemplate(id: string, variables: Record<string, string>) {
  return request<{ data: { bpmnXml: string } }>(`/templates/${id}/instantiate`, {
    method: 'POST',
    body: JSON.stringify({ variables }),
  });
}

// ---- BPMN Generation ----

export function generateBpmn(input: any) {
  return request<{ data: { bpmnXml: string } }>('/bpmn/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function layoutBpmn(bpmnXml: string) {
  return request<{ data: { bpmnXml: string } }>('/bpmn/layout', {
    method: 'POST',
    body: JSON.stringify({ bpmnXml }),
  });
}

export function validateBpmn(bpmnXml: string) {
  return request<{ data: { valid: boolean; errors: string[] } }>('/bpmn/validate', {
    method: 'POST',
    body: JSON.stringify({ bpmnXml }),
  });
}

// ---- Process Maps ----

export function fetchProcessMaps(projectId: string) {
  return request<{ data: any[] }>(`/process-maps?projectId=${projectId}`);
}

export function fetchProcessMap(id: string) {
  return request<{ data: any }>(`/process-maps/${id}`);
}

export function createProcessMap(data: {
  projectId: string;
  name: string;
  bpmnXml: string;
  ownerId: string;
  templateId?: string;
  description?: string;
}) {
  return request<{ data: any }>('/process-maps', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProcessMap(id: string, data: { bpmnXml?: string; name?: string; status?: string }) {
  return request<{ data: any }>(`/process-maps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProcessMap(id: string) {
  return request<{ data: { id: string } }>(`/process-maps/${id}`, { method: 'DELETE' });
}

// ---- Versions ----

export function createVersion(processMapId: string, data: { label?: string; createdById: string }) {
  return request<{ data: any }>(`/process-maps/${processMapId}/versions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchVersions(processMapId: string) {
  return request<{ data: any[] }>(`/process-maps/${processMapId}/versions`);
}

export function restoreVersion(processMapId: string, versionId: string) {
  return request<{ data: any }>(`/process-maps/${processMapId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
}

// ---- Export ----

export function exportProcessMapPdf(id: string, options?: any) {
  return request<Blob>(`/process-maps/${id}/export/pdf`, {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
}

export function exportBpmnPdf(bpmnXml: string, options?: any) {
  return request<Blob>('/export/pdf', {
    method: 'POST',
    body: JSON.stringify({ bpmnXml, options }),
  });
}

// ---- Clients ----

export function fetchClients() {
  return request<{ data: any[] }>('/clients');
}

export function createClient(data: { name: string; industry?: string }) {
  return request<{ data: any }>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---- Projects ----

export function fetchProjects(clientId: string) {
  return request<{ data: any[] }>(`/projects?clientId=${clientId}`);
}

export function createProject(data: { clientId: string; name: string; description?: string }) {
  return request<{ data: any }>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
