import { Database } from "../config/db";
import {
  CreateRefreshTokenDto,
  RefreshToken,
} from "../interfaces/refreshToken.interface";

export class RefreshTokenRepository {
  constructor(private db: Database) {}

  async create(refreshToken: CreateRefreshTokenDto) {
    const result = await this.db.query<RefreshToken>(
      "INSERT INTO refresh_tokens (user_id, token_hash,expires_at) VALUES ($1, $2,$3)",
      [refreshToken.user_id, refreshToken.token_hash, refreshToken.expires_at],
    );

    return result.rows[0] ?? null;
  }

  async findByToken(token: string) {
    const result = await this.db.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1",
      [token],
    );

    return result.rows[0] ?? null;
  }

  async updateTokenRevoked(token_hash: string) {
    const result = await this.db.query(
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
}
