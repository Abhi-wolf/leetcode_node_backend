import { db } from "../config/db";
import { AuthController } from "../controllers/auth.controller";
import { RefreshTokenRepository } from "../repository/refreshToken.repository";
import { UserRepository } from "../repository/user.repository";
import { AuthService } from "../services/auth.services";

export class AuthFactory {
  private static refreshTokenRepository: RefreshTokenRepository;
  private static userRepository: UserRepository;
  private static authService: AuthService;
  private static authController: AuthController;

  static getAuthRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(db);
    }
    return this.userRepository;
  }

  static getRefreshTokenRepository(): RefreshTokenRepository {
    if (!this.refreshTokenRepository) {
      this.refreshTokenRepository = new RefreshTokenRepository(db);
    }
    return this.refreshTokenRepository;
  }

  static getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(
        this.getAuthRepository(),
        this.getRefreshTokenRepository(),
      );
    }
    return this.authService;
  }

  static getAuthController(): AuthController {
    if (!this.authController) {
      this.authController = new AuthController(this.getAuthService());
    }
    return this.authController;
  }
}
