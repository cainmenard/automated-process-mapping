import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { templates } from './schema.js';
import { builtinTemplates } from '@bpmn-app/shared';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function seed() {
  console.log('Seeding built-in templates...');

  let inserted = 0;
  for (const tpl of builtinTemplates) {
    const existing = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.name, tpl.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(templates).values({
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        bpmnXml: tpl.bpmnXml,
        formSchema: tpl.formSchema,
        status: 'published',
        version: 1,
      });
      inserted++;
    }
  }

  console.log(`Seeded ${inserted} new templates (${builtinTemplates.length - inserted} already existed).`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
