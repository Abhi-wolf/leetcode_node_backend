-- Migration: 004_update_role_column_in_users
-- Alter users table to update the role column

CREATE TYPE user_role AS ENUM(
    'ADMIN',
    'USER',
    'PROBLEM_SETTER',
    'MODERATOR'
);

ALTER TABLE users
DROP COLUMN role;

ALTER TABLE users
ADD COLUMN roles user_role[] NOT NULL DEFAULT ARRAY['USER']::user_role[];
