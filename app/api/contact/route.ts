import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface ContactFormData {
  nameSurname: string;
  email: string;
  phoneNumber: string;
  message: string;
  captchaToken: string;
  unitId?: number | null;
  tenantId?: string;
  projectSlug?: string;
  projectId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    if (
      !body.nameSurname ||
      !body.email ||
      !body.phoneNumber ||
      !body.message ||
      !body.captchaToken
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const turnstileSecretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    if (!turnstileSecretKey) {
      console.error("CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: turnstileSecretKey,
          response: body.captchaToken,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      console.error("Turnstile verification failed:", turnstileData);
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    try {
      const response = await axios.post(
        `${apiUrl}/v1/contactforms/contactform`,
        {
          nameSurname: body.nameSurname,
          email: body.email,
          phoneNumber: body.phoneNumber,
          message: body.message,
          unitId: body.unitId || null,
          tenantId: body.tenantId,
          projectSlug: body.projectSlug,
          projectId: body.projectId,
          from: 2,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Contact form submitted successfully:", {
        email: body.email,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Form submitted successfully",
          data: response.data,
        },
        { status: 200 }
      );
    } catch (apiError: any) {
      console.error("Backend API submission error:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
      });

      return NextResponse.json(
        {
          error: "Failed to submit form to backend. Please try again.",
          details: apiError.response?.data?.message || apiError.message,
        },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error("Contact form general error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
