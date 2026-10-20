import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

function isLocalBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return (
    baseUrl.includes("localhost") ||
    baseUrl.includes("127.0.0.1") ||
    baseUrl.startsWith("http://192.") ||
    baseUrl.startsWith("http://10.")
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localePattern = /^\/([a-z]{2})$/;
  const match = pathname.match(localePattern);

  if (match) {
    const locale = match[1];
    // Local geliştirmede fine3d.com.tr'ye atma
    if (isLocalBaseUrl()) {
      return intlMiddleware(request);
    }
    return NextResponse.redirect(new URL(`https://fine3d.com.tr/${locale}`));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
