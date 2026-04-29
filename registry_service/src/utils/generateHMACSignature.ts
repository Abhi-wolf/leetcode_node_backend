// HMAC -- Hash based message authentication code

import crypto from "crypto";

export const generateHMACSignature = (
  data: string,
  secret: string,
) => {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  return signature;
};
