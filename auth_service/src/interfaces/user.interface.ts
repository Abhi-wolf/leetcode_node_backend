export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  is_active: boolean;
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roles?: string[];
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  PROBLEM_SETTER = "PROBLEM_SETTER",
  MODERATOR = "MODERATOR",
}
