// import { Pool, PoolClient, QueryResultRow } from "pg";
// import { serverConfig } from ".";
// import logger from "./logger.config";

// const pool = new Pool({
//   host: serverConfig.DB_HOST,
//   port: serverConfig.DB_PORT,
//   database: serverConfig.DB_NAME,
//   user: serverConfig.DB_USER,
//   password: serverConfig.DB_PASSWORD,
//   max: 10, // max connections in the pool
//   idleTimeoutMillis: 30000, // close idle clients after 30 seconds
//   connectionTimeoutMillis: 5000, // fail fast if can't connect
// });

// pool.on("error", (err) => {
//   logger.error("Database error", err);
// });

// /**
//  * Simple liveness check - used at startup, not for schema checks.
//  * Check the database connection by querying a simple SELECT statement.
//  */
// export async function checkDbConnection() {
//   const client = await pool.connect();

//   try {
//     await client.query("SELECT 1");
//     logger.info("Database connection successful");
//   } catch (err) {
//     logger.error("Database connection failed", err);
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// /**
//  * Executes a SQL query and returns the result rows.
//  * @param text The SQL query text.
//  * @param params Optional query parameters.
//  * @returns The result rows as an array of records.
//  */
// export async function query<T extends QueryResultRow = QueryResultRow>(
//   text: string,
//   params?: unknown[],
// ): Promise<T[]> {
//   const result = await pool.query<T>(text, params);
//   return result.rows;
// }

// export async function withTransaction<T>(
//   fn: (client: PoolClient) => Promise<T>,
// ): Promise<T> {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const result = await fn(client);
//     await client.query("COMMIT");
//     return result;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// export default pool;

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

  async checkConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("SELECT 1");
      logger.info("Database connection successful");
    } catch (err) {
      logger.error("Database connection failed", err);
      throw err;
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
