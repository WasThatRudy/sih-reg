import { NextRequest } from "next/server";
import { auth as adminAuth } from "../firebase-admin";
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
    console.log("🔍 Starting auth verification...");

    await dbConnect();
    console.log("✅ Database connected");

    const authHeader = request.headers.get("authorization");
    console.log(
      "🔑 Auth header:",
      authHeader
        ? `Bearer ${authHeader.split(" ")[1].substring(0, 20)}...`
        : "None"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid auth header");
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    console.log("🎫 Token length:", token.length);

    // Check if Firebase Admin Auth is available
    console.log("🔥 Firebase Admin Auth available:", !!adminAuth);
    if (!adminAuth) {
      console.log("❌ Firebase Admin not initialized");
      throw new Error("Firebase Admin not initialized");
    }

    // Verify Firebase token
    console.log("🔐 Verifying Firebase token...");
    const decodedToken = await adminAuth.verifyIdToken(token, true); // checkRevoked: true
    console.log("✅ Token verified, UID:", decodedToken.uid);
    console.log(
      "🕒 Token issued at:",
      new Date(decodedToken.iat * 1000).toISOString()
    );
    console.log(
      "🕒 Token expires at:",
      new Date(decodedToken.exp * 1000).toISOString()
    );
    console.log("🕒 Current time:", new Date().toISOString());

    // Get user from database
    console.log("👤 Looking for user in database with UID:", decodedToken.uid);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    console.log("👤 User found:", !!user);

    if (!user) {
      console.log("❌ User not found in database");
      throw new Error("User not found");
    }

    console.log("✅ User details:", {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: user.firebaseUid || decodedToken.uid,
    };

    console.log("🎉 Auth verification successful");
    return authenticatedRequest;
  } catch (error) {
    console.error("❌ Auth verification error:", error);

    // More detailed error logging for Firebase authentication
    if (error && typeof error === "object" && "code" in error) {
      const firebaseError = error as { code: string; message: string };
      console.error("🔥 Firebase error code:", firebaseError.code);
      console.error("🔥 Firebase error message:", firebaseError.message);

      switch (firebaseError.code) {
        case "auth/id-token-expired":
          console.error("🕒 Token has expired - need to refresh");
          break;
        case "auth/id-token-revoked":
          console.error("🚫 Token has been revoked");
          break;
        case "auth/invalid-id-token":
          console.error("⚠️ Token format is invalid");
          break;
        case "auth/user-disabled":
          console.error("👤 User account is disabled");
          break;
        default:
          console.error("❓ Unknown Firebase auth error");
      }
    }

    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code:
        error && typeof error === "object" && "code" in error
          ? (error as { code: unknown }).code
          : undefined,
      stack:
        error instanceof Error ? error.stack?.substring(0, 200) : undefined,
    });
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
