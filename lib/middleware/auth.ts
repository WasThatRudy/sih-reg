import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "../firebase-admin";
import { User } from "../../models/User";
import dbConnect from "../mongodb";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: "leader" | "admin";
    firebaseUid: string;
  };
}

/**
 * Verify Firebase ID token and get user from database
 */
export async function verifyAuth(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  try {
    await dbConnect();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!auth) {
      throw new Error("Firebase Admin not initialized");
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Get user from database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      throw new Error("User not found");
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: user.firebaseUid,
    };

    return authenticatedRequest;
  } catch (error) {
    console.error("Auth verification error:", error);
    throw new Error("Authentication failed");
  }
}


/**
 * Middleware to verify admin role
 */
export async function verifyAdmin(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await verifyAuth(request);

  if (authenticatedRequest.user?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return authenticatedRequest;
}

/**
 * Middleware to verify team leader role
 */
export async function verifyLeader(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await verifyAuth(request);

  if (authenticatedRequest.user?.role !== "leader") {
    throw new Error("Team leader access required");
  }

  return authenticatedRequest;
}

/**
 * Generate JWT token for internal use (optional, for additional security)
 */
export function generateJWT(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
}

/**
 * Verify JWT token (optional, for additional security)
 */
export function verifyJWT(token: string): object {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as object;
  } catch {
    throw new Error("Invalid token");
  }
}
