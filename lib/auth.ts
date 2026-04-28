import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing. Set JWT_SECRET in .env/.env.local before using auth endpoints."
    );
  }
  return JWT_SECRET;
}

export type AuthPayload = {
  userId: string;
  email: string;
};

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, requireJwtSecret(), {
    expiresIn: "7d",
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, requireJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}