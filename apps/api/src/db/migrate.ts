import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsPath = join(__dirname, '..', '..', 'drizzle');

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function runMigrations() {
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: migrationsPath });
  console.log('Migrations complete.');
  await client.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
