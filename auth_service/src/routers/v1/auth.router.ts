import express from "express";
import { validateRequestBody } from "../../validators";
import { AuthFactory } from "../../factory/auth.factory";
import {
  deleteAccountSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updateUserSchema,
} from "../../validators/auth.validator";

const authController = AuthFactory.getAuthController();

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateRequestBody(registerSchema),
  authController.register,
);
authRouter.post(
  "/login",
  validateRequestBody(loginSchema),
  authController.login,
);

// TODO: remove this or make it a authorized route with proper validation and remove the deleteAccountSchema
// Only for development purposes
authRouter.delete(
  "/deleteAccount",
  validateRequestBody(deleteAccountSchema),
  authController.deleteAccount,
);

authRouter.put(
  "/refreshToken",
  validateRequestBody(refreshTokenSchema),
  authController.refreshToken,
);

authRouter.patch(
  "/:id",
  validateRequestBody(updateUserSchema),
  authController.updateUser,
);

authRouter.get("/:id", authController.getMe);

export default authRouter;
