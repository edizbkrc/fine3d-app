import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface TokenPayload {
  projectId: string;
  userId: string;
  tenantId: string;
  purpose: string;
  nonce: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Token validation failed" },
      { status: 500 }
    );
  }
}

async function validateToken(token: string): Promise<{
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}> {
  try {
    const jwtSecret = process.env.FINE3D_JWT_SECRET;

    if (!jwtSecret) {
      return { valid: false, error: "JWT secret not configured" };
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      {
        issuer: "fine3d-portal",
        audience: "fine3d-app",
      }
    );

    const tokenPayload = payload as unknown as TokenPayload;

    if (tokenPayload.purpose !== "fine3d_access") {
      return { valid: false, error: "Invalid token purpose" };
    }

    return { valid: true, payload: tokenPayload };
  } catch (error) {
    console.error("Token validation error:", error);
    return { valid: false, error: "Token validation failed" };
  }
}
