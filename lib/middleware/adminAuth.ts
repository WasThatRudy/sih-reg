import { NextRequest } from "next/server";

export interface AdminAuthenticatedRequest extends NextRequest {
  admin?: {
    email: string;
    isAuthenticated: boolean;
  };
}

export async function verifyAdminAuth(
  request: NextRequest
): Promise<AdminAuthenticatedRequest> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      throw new Error("No admin credentials provided");
    }

    // Extract Basic auth credentials
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [email, password] = credentials.split(":");

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials not configured");
    }

    // Verify credentials
    if (email === adminEmail && password === adminPassword) {
      const authenticatedRequest = request as AdminAuthenticatedRequest;
      authenticatedRequest.admin = {
        email: adminEmail,
        isAuthenticated: true,
      };
      return authenticatedRequest;
    } else {
      throw new Error("Invalid admin credentials");
    }
  } catch (error) {
    console.error("Admin auth verification error:", error);
    throw new Error("Admin authentication failed");
  }
}
