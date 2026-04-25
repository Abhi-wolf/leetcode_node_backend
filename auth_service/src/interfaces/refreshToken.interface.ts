export interface RefreshToken {
  id: number;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}

export interface CreateRefreshTokenDto {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}
