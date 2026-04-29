import { NextFunction, Request, Response } from "express";
import { serverConfig } from "../config";
import { generateHMACSignature } from "../utils/generateHMACSignature";
import crypto from "crypto";

export const verifyHAMCSignature = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const signHeader: string =
    (req.headers["x-registry-signature"] as string) || "";
  const secret = serverConfig.REGISTRY_HMAC_SHARED_SECRET;

  if (!signHeader) {
    console.log("HMAC verifyHMACSingnature= Missing necessary headers");

    res.status(401).json({
      success: false,
      message: "Missing x-registry-signature header",
    });

    return;
  }

  const body = req.body;
  const expectedSignature = generateHMACSignature(JSON.stringify(body), secret);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signHeader),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    res.status(401).json({
      success: false,
      message: "Invalid signature",
    });

    return;
  }

  // checking if the request is not older than 5 minutes
  if (Date.now() - parseInt(body.timestamp) > 5 * 60 * 1000) {
    res.status(401).json({
      success: false,
      message: "Request expired",
    });

    return;
  }

  next();
};
