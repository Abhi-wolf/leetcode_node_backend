import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.services";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    console.log("register AuthController", email, password, name);

    const data = await this.authService.register(email, password, name);
    res.status(201).json({
      message: "User registered successfully",
      data,
    });
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const data = await this.authService.login(email, password);
    res.status(200).json({
      message: "User logged in successfully",
      data,
    });
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await this.authService.deleteUser(email);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const data = await this.authService.refreshToken(refreshToken);

    res.status(200).json({
      message: "New refreshed token",
      data,
    });
  };

  updateUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    const data = await this.authService.updateUser(id, req.body);

    res.status(200).json({
      message: "User updated successfully",
      data,
    });
  };

  getMe = async (req: Request, res: Response) => {
    const id = req.params.id;

    const data = await this.authService.getMe(id);

    res.status(200).json({
      message: "User fetched successfully",
      data,
    });
  };
}
