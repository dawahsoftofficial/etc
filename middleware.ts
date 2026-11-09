import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig, needsSignIn } from "./auth.config";
import { getClientIp } from "@/lib/client-ip";
import { buildCsp, securityHeaders } from "@/lib/csp";
import { siteAccessLimiter } from "@/lib/rate-limit";
import { checkSiteAccess, parseSiteAccess, SITE_ACCESS_REALM, siteAccessExempt } from "@/lib/site-access";

const { auth } = NextAuth(authConfig);

const policy = (nonce: string) => buildCsp(nonce, { dev: process.env.NODE_ENV !== "production" });

function secure(res: NextResponse, csp: string): NextResponse {
  res.headers.set("Content-Security-Policy", csp);
  for (const [k, v] of Object.entries(securityHeaders())) res.headers.set(k, v);
  return res;
}

/** Fresh nonce per request, passed to rendering via request headers (Next applies it to its own scripts). */
function next(req: NextRequest): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const csp = policy(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  return secure(NextResponse.next({ request: { headers } }), csp);
}

// Auth.js still runs a custom handler when `authorized` says no, so the admin guard redirects here itself.
const admin = auth((req) => {
  if (needsSignIn(req.nextUrl.pathname) && !req.auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return secure(NextResponse.redirect(url), policy(btoa(crypto.randomUUID())));
  }
  return next(req);
});

/** Temporary private preview: with SITE_ACCESS set, nothing but the health check is served without a login. */
function previewGate(req: NextRequest): NextResponse | null {
  const users = parseSiteAccess(process.env.SITE_ACCESS);
  if (!users || siteAccessExempt(req.nextUrl.pathname)) return null;
  const result = checkSiteAccess(req.headers.get("authorization"), getClientIp(req.headers), users, siteAccessLimiter);
  if (result === "ok") return null;
  const res =
    result === "locked"
      ? new NextResponse("Too many failed sign-in attempts. Try again later.", { status: 429, headers: { "Retry-After": "900" } })
      : new NextResponse("This site is a private preview. Sign in with the login you were given.", {
          status: 401,
          headers: { "WWW-Authenticate": SITE_ACCESS_REALM },
        });
  res.headers.set("Content-Type", "text/plain; charset=utf-8");
  res.headers.set("Cache-Control", "no-store");
  return secure(res, "default-src 'none'; frame-ancestors 'none'");
}

const isStaticAsset = (path: string) => path.startsWith("/_next/static/") || path.startsWith("/_next/image") || path === "/favicon.ico";

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const gate = previewGate(req);
  if (gate) return gate;
  const path = req.nextUrl.pathname;
  if (isStaticAsset(path)) return NextResponse.next();
  return path === "/admin" || path.startsWith("/admin/") ? admin(req, ev as never) : next(req);
}

// Every request passes through, so the preview gate also covers scripts, images and the image optimizer.
export const config = { matcher: ["/:path*"] };
