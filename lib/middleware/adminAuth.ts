import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin";
import dbConnect from "../mongodb";

export interface AdminAuthenticatedRequest extends NextRequest {
  admin?: {
    _id: string;
    email: string;
  };
}

export interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and get admin from database
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<AdminAuthenticatedRequest> {
  try {
    await dbConnect();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256'] // Specify the algorithm for admin JWT tokens
      }) as JWTPayload;
      
      if (decoded.role !== "admin") {
        throw new Error("Admin access required");
      }

      // Get admin from database
      const admin = await Admin.findById(decoded.adminId).select("-passwordHash");
      if (!admin) {
        throw new Error("Admin not found");
      }

      // Add admin to request
      const authenticatedRequest = request as AdminAuthenticatedRequest;
      authenticatedRequest.admin = {
        _id: admin._id.toString(),
        email: admin.email,
      };

      return authenticatedRequest;
    } catch (jwtError) {
      // Check if this might be a Firebase token (different algorithm/structure)
      if (jwtError instanceof Error && jwtError.message.includes('invalid algorithm')) {
        throw new Error("Firebase token provided to admin endpoint - use admin JWT token");
      }
      console.error("JWT verification failed:", jwtError);
      throw new Error("Invalid admin JWT token");
    }
  } catch (error) {
    console.error("Admin auth verification error:", error);
    throw new Error("Authentication failed");
  }
}
