import dotenv from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { Pool, PoolClient } from "pg";
import { join } from "path";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const MIGRATIONS_DIR = join(__dirname, "../migrations");

/**
 * Ensures that the `schema_migrations` table exists in the database.
 *
 * This table is used to track which migration files have already been applied.
 * It is created once during bootstrap and reused across all migration runs.
 *
 * Must be called before executing any migration commands (`up`, `down`, `status`)
 * to guarantee that migration state can be recorded and queried safely.
 *
 * Idempotent: safe to call multiple times — no-op if the table already exists.
 *
 * @param client - Active PostgreSQL client connection (PoolClient)
 */
async function ensureMigrationsTable(client: PoolClient) {
  await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id          SERIAL        PRIMARY KEY,
        name        VARCHAR(255)  NOT NULL,
        applied_at  TIMESTAMPTZ   DEFAULT NOW()
      )
    `);
}

/**
 * get all the migration files from the migrations directory and returns the string array
 */
function getMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // alphabetical order
}

async function getAppliedMigrations(client: PoolClient): Promise<string[]> {
  const result = await client.query(
    "SELECT name FROM schema_migrations ORDER BY id ASC",
  );
  return result.rows.map((row) => row.name);
}

async function up() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const appliedMigrations = await getAppliedMigrations(client);
    const migrationFiles = getMigrationFiles();

    const pendingMigrations = migrationFiles.filter(
      (f) => !appliedMigrations.includes(f),
    );

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to apply.");
      return;
    }

    console.log(
      `Applying ${pendingMigrations.length} pending migrations.............`,
    );

    for (const migrationFile of pendingMigrations) {
      const sql = readFileSync(join(MIGRATIONS_DIR, migrationFile), "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          migrationFile,
        ]);
        await client.query("COMMIT");
        console.log(`  ✓  ${migrationFile}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`  ✗  ${migrationFile} - FAILED, rolled back`, error);
        throw error;
      }
    }
    console.log("All migrations applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

// for down migration the file names should follow the pattern ".down.sql" with the same name as the up migration
async function down() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const appliedMigrations = await getAppliedMigrations(client);

    if (appliedMigrations.length === 0) {
      console.log("No migrations to roll back.");
      return;
    }

    const last = appliedMigrations[appliedMigrations.length - 1];

    const downFile = last.replace(".up.sql", ".down.sql");
    const downFilePath = join(MIGRATIONS_DIR, downFile);

    let hasDownScript = false;

    try {
      readFileSync(downFilePath, "utf-8");
      hasDownScript = true;
    } catch (error) {
      hasDownScript = false;
    }

    if (!hasDownScript) {
      console.error(
        `❌ No rollback script found for "${last}".\n` +
          `   Create "${downFile}" to enable rollbacks.`,
      );
      process.exit(1);
    }

    const sql = readFileSync(downFilePath, "utf-8");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("DELETE FROM schema_migrations WHERE name = $1", [
        last,
      ]);
      await client.query("COMMIT");
      console.log(`✅ Rolled back: ${last}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`✗ Rollback failed for ${last}`);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function status() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const appliedMigrations = await getAppliedMigrations(client);
    const allMigrations = getMigrationFiles();

    console.log("\nMigration Status:");
    console.log("─".repeat(50));

    for (const file of allMigrations) {
      const isApplied = appliedMigrations.includes(file);
      console.log(`  ${isApplied ? "✓" : "○"} ${file}`);
    }

    console.log("─".repeat(50));
    console.log(
      `  ${appliedMigrations.length}/${allMigrations.length} applied\n`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

// for commands
const command = process.argv[2];
const commands: Record<string, () => Promise<void>> = {
  up: up,
  down: down,
  status: status,
};

if (!command || !commands[command]) {
  console.error("Usage: ts-node scripts/migrate.ts [up|down|status]");
  process.exit(1);
}

commands[command]().catch((err) => {
  console.error("Migration error:", err.message);
  process.exit(1);
});
