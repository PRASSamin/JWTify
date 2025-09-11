import { NextResponse, NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-current-url", request.nextUrl.href);
  return NextResponse.next({ headers });
}

// Match only necessary routes (skip static assets, _next, and public files)
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
