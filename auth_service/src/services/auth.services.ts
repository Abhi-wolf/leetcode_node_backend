import { UserRepository } from "../repository/user.repository";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import bcrypt from "bcrypt";
import { RefreshTokenRepository } from "../repository/refreshToken.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors/app.error";
import { CreateUserDto, UserRole } from "../interfaces/user.interface";
import ms from "ms";
import { Database } from "../config/db";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private db: Database,
  ) { }

  /**
   * Generate access and refresh tokens
   * @param user - User objectAuthSer
   * @returns { accessToken: string, refreshToken: string } - Generated tokens
   */
  private generateAccessToken(user: { id: string; email: string }) {
    const payload: jwt.JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    try {
      const accessToken = jwt.sign(payload, serverConfig.JWT_ACCESS_SECRET, {
        expiresIn: serverConfig.JWT_ACCESS_EXPIRES_IN as any,
      });

      return accessToken;
    } catch (error) {
      logger.error("Token generation failed", error);
      throw new Error("Failed to generate tokens");
    }
  }

  /**
   * Generate a cryptographically secure random refresh token
   * @returns {string} - Generated refresh token
   */
  private generateRefreshToken(): string {
    // Cryptographically secure random token
    return crypto.randomBytes(64).toString("hex");
  }

  /**
   * Hash a token using SHA-256
   * @param token - Token to hash
   * @returns {string} - Hashed token
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Register a new user
   * @param email - User email
   * @param password - User password
   * @param name - User name
   * @returns { accessToken: string, refreshToken: string, user: { email: string, name: string, id: string } } - Generated tokens and user details
   */
  async register(email: string, password: string, name: string) {
    const registeredUser = await this.userRepository.findByEmail(email);

    if (registeredUser) {
      throw new BadRequestError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      roles: [UserRole.USER, UserRole.PROBLEM_SETTER, UserRole.MODERATOR],
    });

    if (!user) {
      throw new InternalServerError("Failed to create user");
    }

    const userDetails = {
      email: user.email,
      name: user.name,
      id: user.id,
      roles: user.roles,
    };

    logger.info(`New user registered: ${email}`);

    return {
      user: userDetails,
    };
  }

  /**
   * Login a user
   * @param email - User email
   * @param password - User password
   * @returns { accessToken: string, refreshToken: string, user: { email: string, name: string, id: string } } - Generated tokens and user details
   */
  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid password");
    }

    const refreshToken = this.generateRefreshToken();

    const duration = ms(serverConfig.JWT_REFRESH_EXPIRES_IN as ms.StringValue);

    await this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: this.hashToken(refreshToken),
      expires_at: new Date((Date.now() + duration) as any),
    });

    const userDetails = {
      email: user.email,
      name: user.name,
      id: user.id,
      roles: user.roles,
    };

    logger.info(`User logged in: ${email}`);

    return {
      accessToken: this.generateAccessToken(userDetails),
      refreshToken,
      user: userDetails,
    };
  }

  /**
   *
   * @param id
   * @returns {user:{name:string, email:string, id:string, roles:string[]}}
   */
  async getMe(id: string) {
    const userFromDb = await this.userRepository.findById(id);

    if (!userFromDb) throw new NotFoundError("User not found");

    const user = {
      email: userFromDb.email,
      name: userFromDb.name,
      id: userFromDb.id,
      roles: userFromDb.roles,
    };

    return user;
  }

  async deleteUser(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const result = await this.userRepository.delete(user.id);

    if (result) {
      logger.info(`User deleted: ${email}`);
      return true;
    }

    throw new InternalServerError("Failed to delete user");
  }

  /**
   *
   * @param token
   * @returns { accessToken: string, refreshToken: string} - Generated tokens
   */
  async refreshToken(token: string) {
    const hashedRefreshToken = this.hashToken(token);

    const tokenFromDb =
      await this.refreshTokenRepository.findByToken(hashedRefreshToken);

    if (
      !tokenFromDb ||
      tokenFromDb.revoked_at ||
      tokenFromDb.expires_at <= Date.now()
    ) {
      throw new BadRequestError("Invalid token");
    }

    const user = await this.userRepository.findById(tokenFromDb.user_id);

    if (!user || !user.is_active) throw new NotFoundError("User not found");

    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = this.generateRefreshToken();

    const duration = ms(serverConfig.JWT_REFRESH_EXPIRES_IN as ms.StringValue);

    await this.db.withTransaction(async (client) => {
      const revokeResult = await this.refreshTokenRepository.updateTokenRevoked(
        hashedRefreshToken,
        client,
      );

      if (!revokeResult.success) {
        throw new BadRequestError("Token already revoked or not found");
      }

      await this.refreshTokenRepository.create(
        {
          user_id: user.id,
          token_hash: this.hashToken(refreshToken),
          expires_at: new Date((Date.now() + duration) as any),
        },
        client,
      );
    });

    logger.info(`Token refreshed for user ${user.id}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   *
   * @param id
   * @param data:{email?:string, name?:string, password?:string}
   * @returns {email:string, name:string, id:string, roles: string[]} - updated user data
   */
  async updateUser(
    id: string,
    data: {
      email?: string;
      name?: string;
      password?: string;
    },
  ) {
    const userFromDb = await this.userRepository.findById(id);

    if (!userFromDb) throw new NotFoundError("User not found");

    const updateFields: Partial<CreateUserDto> = {};

    if (data.email) updateFields.email = data.email;
    if (data.name) updateFields.name = data.name;
    if (data.password) {
      updateFields.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updateFields).length === 0)
      throw new BadRequestError("Requires a field and value to update");

    let updatedUser;

    if (data.password) {
      // Revoke all active refresh tokens for security when password changes

      await this.db.withTransaction(async (client) => {
        await this.refreshTokenRepository.revokeAllUserTokens(id, client);

        updatedUser = await this.userRepository.update(id, updateFields, client);
      });

    } else {
      updatedUser = await this.userRepository.update(id, updateFields);
    }

    if (!updatedUser) throw new InternalServerError("User update failed");

    const user = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roles: updatedUser.roles,
    };

    return user;
  }
}
