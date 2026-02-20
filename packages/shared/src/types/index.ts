// ---- Domain types ----

export interface Client {
  id: string;
  name: string;
  industry?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface ProcessMap {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  bpmnXml: string;
  status: ProcessMapStatus;
  templateId?: string | null;
  ownerId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type ProcessMapStatus = 'draft' | 'review' | 'approved' | 'published';

export interface ProcessMapVersion {
  id: string;
  processMapId: string;
  versionNumber: number;
  label?: string;
  bpmnXml: string;
  createdById: string;
  createdAt: Date;
}

// ---- Template types ----

export interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  bpmnXml: string;
  formSchema: TemplateFormSchema;
  thumbnailUrl?: string;
  status: TemplateStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory =
  | 'financial-close'
  | 'accounts-payable'
  | 'accounts-receivable'
  | 'payroll'
  | 'procurement'
  | 'revenue-recognition'
  | 'inventory'
  | 'compliance'
  | 'general';

export type TemplateStatus = 'draft' | 'published' | 'deprecated';

export interface TemplateFormSchema {
  fields: TemplateFormField[];
  lanes: TemplateLaneConfig[];
}

export interface TemplateFormField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiline' | 'number';
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  group?: string;
}

export interface TemplateLaneConfig {
  placeholder: string;
  label: string;
  defaultValue: string;
}

// ---- BPMN generation types ----

export interface BpmnGenerationInput {
  templateId?: string;
  variables: Record<string, string>;
  lanes: LaneDefinition[];
  tasks: TaskDefinition[];
  gateways?: GatewayDefinition[];
}

export interface LaneDefinition {
  id: string;
  name: string;
}

export interface TaskDefinition {
  id: string;
  name: string;
  type: BpmnTaskType;
  laneId: string;
  description?: string;
}

export type BpmnTaskType =
  | 'userTask'
  | 'serviceTask'
  | 'scriptTask'
  | 'manualTask'
  | 'sendTask'
  | 'receiveTask'
  | 'businessRuleTask'
  | 'task';

export interface GatewayDefinition {
  id: string;
  name?: string;
  type: BpmnGatewayType;
  laneId: string;
}

export type BpmnGatewayType =
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'inclusiveGateway'
  | 'eventBasedGateway';

// ---- Export types ----

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg';
  branding?: BrandingOptions;
  paperSize?: 'A4' | 'A3' | 'letter';
  orientation?: 'portrait' | 'landscape';
  scale?: number;
}

export interface BrandingOptions {
  logoUrl?: string;
  companyName: string;
  primaryColor?: string;
  footerText?: string;
}

// ---- API types ----

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
