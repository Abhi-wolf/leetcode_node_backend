import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { serverConfig } from ".";
import logger from "./logger.config";

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: serverConfig.DB_HOST,
      port: serverConfig.DB_PORT,
      database: serverConfig.DB_NAME,
      user: serverConfig.DB_USER,
      password: serverConfig.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on("error", (err: Error) => {
      logger.error("Unexpected DB error", err);
    });
  }

  async checkConnection(): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("SELECT 1");
      logger.info("Database connection successful");
      return true;
    } catch (err) {
      logger.error("Database connection failed", err);
      return false;
    } finally {
      client.release();
    }
  }

  // async query<T extends QueryResultRow = QueryResultRow>(
  //   text: string,
  //   params?: unknown[],
  // ): Promise<T[]> {
  //   const result = await this.pool.query<T>(text, params);
  //   return result.rows;
  // }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async shutdown(): Promise<void> {
    logger.info("Closing DB pool...");
    await this.pool.end();
    logger.info("DB pool closed");
  }
}

export const db = new Database();
