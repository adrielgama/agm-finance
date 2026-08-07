import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/login"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(getSessionCookie(req));
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
