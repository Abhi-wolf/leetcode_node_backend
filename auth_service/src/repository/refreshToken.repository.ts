import { PoolClient, QueryResult, QueryResultRow } from "pg";
import { Database } from "../config/db";
import {
  CreateRefreshTokenDto,
  RefreshToken,
} from "../types/refreshToken.interface";

type QueryExecutor = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ) => Promise<QueryResult<T>>;
};

export class RefreshTokenRepository {
  constructor(private db: Database) {}

  async create(refreshToken: CreateRefreshTokenDto,client?: PoolClient) {
     const executor: QueryExecutor = client ?? this.db;

    const result = await executor.query<RefreshToken>(
      "INSERT INTO refresh_tokens (user_id, token_hash,expires_at) VALUES ($1, $2,$3)",
      [refreshToken.user_id, refreshToken.token_hash, refreshToken.expires_at],
    );

    return result.rows[0] ?? null;
  }

  async findByToken(token: string,client?: PoolClient) {
     const executor: QueryExecutor = client ?? this.db;

    const result = await executor.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1",
      [token],
    );

    return result.rows[0] ?? null;
  }

  async updateTokenRevoked(token_hash: string,client?: PoolClient) {
     const executor: QueryExecutor = client ?? this.db;

    const result = await executor.query(
      `UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = $1 AND revoked_at IS NULL
        RETURNING id`,
      [token_hash],
    );

    return {
      success: (result.rowCount ?? 0) > 0,
      row: result.rows[0] ?? null,
    };
  }

  async revokeAllUserTokens(user_id: string, client?: PoolClient) {
    const executor: QueryExecutor = client ?? this.db;

    const result = await executor.query(
      `UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL
        RETURNING id`,
      [user_id],
    );

    return {
      success: true,
      count: result.rowCount ?? 0,
    };
  }
}
