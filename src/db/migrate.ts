import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { pool } from './pool';

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const name = file;
    const existing = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
    if (existing.rowCount) {
      continue;
    }

    const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
  }

  console.log('Migrations complete');
}

runMigrations()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void pool.end();
  });
