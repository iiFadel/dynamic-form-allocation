import { createHmac, timingSafeEqual } from "crypto";
import { FormDefinition } from "@/types/forms";

const SECRET = process.env.FORM_TOKEN_SECRET || "local-dev-secret";

const sign = (payload: string) =>
  createHmac("sha256", SECRET).update(payload).digest("base64url");

export const encodeFormToken = (definition: FormDefinition): string => {
  const payload = Buffer.from(JSON.stringify(definition), "utf-8").toString(
    "base64url",
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

export const decodeFormToken = (
  token: string | null | undefined,
): FormDefinition | null => {
  if (!token) {
    return null;
  }

  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) {
      return null;
    }

    const expectedSignature = sign(payload);
    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json) as FormDefinition;
  } catch (error) {
    console.error("Invalid form token:", error);
    return null;
  }
};

