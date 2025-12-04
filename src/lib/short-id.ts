import { encodeFormToken, decodeFormToken } from "./form-token";
import { FormDefinition } from "@/types/forms";

// In-memory storage for short ID to token mapping
// In production, you might want to use Redis or a database
const shortIdMap = new Map<string, string>();

// Generate a short random ID (8 characters)
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a short ID for a form definition and stores the mapping
 */
export function createShortId(definition: FormDefinition): string {
  const token = encodeFormToken(definition);
  let shortId = generateShortId();
  
  // Ensure uniqueness (very unlikely collision, but just in case)
  while (shortIdMap.has(shortId)) {
    shortId = generateShortId();
  }
  
  shortIdMap.set(shortId, token);
  return shortId;
}

/**
 * Resolves a short ID to a form definition
 */
export function resolveShortId(shortId: string | null | undefined): FormDefinition | null {
  if (!shortId) {
    return null;
  }
  
  const token = shortIdMap.get(shortId);
  if (!token) {
    return null;
  }
  
  return decodeFormToken(token);
}

/**
 * Gets the full token for a short ID (for submission)
 */
export function getTokenFromShortId(shortId: string | null | undefined): string | null {
  if (!shortId) {
    return null;
  }
  
  return shortIdMap.get(shortId) || null;
}

