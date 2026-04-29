import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import logger from "../config/logger.config";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    const data = await this.authService.register(email, password, name);
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data,
    });
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    logger.debug(`Login request for email: ${email}`);

    const data = await this.authService.login(email, password);
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data,
    });
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await this.authService.deleteUser(email);

    res.status(200).json({
      message: "Account deleted successfully",
      success: true,
    });
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const data = await this.authService.refreshToken(refreshToken);

    res.status(200).json({
      message: "New refreshed token",
      success: true,
      data,
    });
  };

  updateUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    const data = await this.authService.updateUser(id, req.body);

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data,
    });
  };

  getMe = async (req: Request, res: Response) => {
    const id = req.params.id;

    const data = await this.authService.getMe(id);

    res.status(200).json({
      message: "User fetched successfully",
      success: true,
      data,
    });
  };
}
