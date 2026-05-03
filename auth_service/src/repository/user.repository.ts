import { Database } from "../config/db";
import { CreateUserDto, User } from "../types/user.interface";
import { parsePgArray } from "../utils/parsePgArray";
import { PoolClient, QueryResult, QueryResultRow } from "pg";

type QueryExecutor = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ) => Promise<QueryResult<T>>;
};

export class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string) {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );

    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      ...user,
      roles: parsePgArray(user.roles),
    };
  }

  async findByEmail(email: string) {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      ...user,
      roles: parsePgArray(user.roles),
    };
  }

  async create(user: CreateUserDto) {
    const result = await this.db.query<User>(
      "INSERT INTO users (email, password, name, roles) VALUES ($1, $2, $3, $4) RETURNING id, email, name, roles, created_at",
      [user.email, user.password, user.name, user.roles],
    );

    const newuser = result.rows[0];

    if (!newuser) {
      return null;
    }

    return {
      ...newuser,
      roles: parsePgArray(newuser.roles),
    };
  }

  async delete(id: string) {
    const result = await this.db.query<{ id: string }>(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async update(id: string, fields: Partial<CreateUserDto>, client?: PoolClient) {
    const executor: QueryExecutor = client ?? this.db;

    const entries = Object.entries(fields).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return null;

    const setClause = entries
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = entries.map(([, val]) => val);

    const result = await executor.query<User>(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, email, name, roles`,
      [id, ...values],
    );

    const updated = result.rows[0];

    if (!updated) return null;

    return {
      ...updated,
      roles: parsePgArray(updated.roles),
    };
  }
}
