import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// ---- Clients ----
export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    industry: text('industry'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('idx_clients_deleted').on(table.deletedAt)]
);

// ---- Projects ----
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .references(() => clients.id)
      .notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status', { enum: ['active', 'completed', 'archived'] })
      .default('active')
      .notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_projects_client').on(table.clientId),
    index('idx_projects_deleted').on(table.deletedAt),
  ]
);

// ---- Process Maps ----
export const processMaps = pgTable(
  'process_maps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    name: text('name').notNull(),
    description: text('description'),
    bpmnXml: text('bpmn_xml').notNull(),
    status: text('status', {
      enum: ['draft', 'review', 'approved', 'published'],
    })
      .default('draft')
      .notNull(),
    templateId: text('template_id'),
    ownerId: text('owner_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    searchContent: text('search_content'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_process_maps_project').on(table.projectId),
    index('idx_process_maps_owner').on(table.ownerId),
    index('idx_process_maps_deleted').on(table.deletedAt),
  ]
);

// ---- Process Map Versions ----
export const processMapVersions = pgTable(
  'process_map_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processMapId: uuid('process_map_id')
      .references(() => processMaps.id)
      .notNull(),
    versionNumber: integer('version_number').notNull(),
    label: text('label'),
    bpmnXml: text('bpmn_xml').notNull(),
    createdById: text('created_by_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_versions_process_map').on(table.processMapId),
  ]
);

// ---- Templates ----
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  bpmnXml: text('bpmn_xml').notNull(),
  formSchema: jsonb('form_schema').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  status: text('status', { enum: ['draft', 'published', 'deprecated'] })
    .default('draft')
    .notNull(),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- User-Project junction ----
export const userProjects = pgTable(
  'user_projects',
  {
    userId: text('user_id').notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    role: text('role', { enum: ['owner', 'editor', 'viewer'] })
      .default('editor')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_user_projects_user').on(table.userId),
    index('idx_user_projects_project').on(table.projectId),
  ]
);
