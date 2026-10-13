import crypto from "crypto";
import express, { NextFunction, Request, Response } from "express";
import { z } from "zod";

/*
 * Single-user login for a small business app.
 *
 * Setup (environment variables):
 *   ADMIN_PASSWORD  required. Anyone without it cannot use the app.
 *   ADMIN_USERNAME  optional, defaults to "admin".
 *   SESSION_SECRET  optional. Signs the login cookie. If it is not set a key is
 *                   derived from ADMIN_PASSWORD, so changing the password also
 *                   logs everyone out.
 *   DEMO_ENABLED    optional. "true" adds a read-only demo that shows fake data.
 *
 * The login is a signed cookie, so nothing is stored on the server and it works
 * on Vercel's serverless functions.
 */

type Role = "admin" | "demo";

interface Session {
  role: Role;
  username: string;
  exp: number; // ms since epoch
}

const COOKIE = "hc_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const isHosted = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const adminUsername = () => process.env.ADMIN_USERNAME || "admin";
const adminPassword = () => process.env.ADMIN_PASSWORD || "";
export const authConfigured = () => Boolean(adminPassword());
export const demoEnabled = () => process.env.DEMO_ENABLED === "true";

/** In local development with no password set, login is switched off (with a warning). */
const authDisabled = () => !authConfigured() && !isHosted;

// ---------- signed cookie ----------

function secretKey() {
  return process.env.SESSION_SECRET || `healthychef-session:${adminPassword()}`;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so both buffers have the same length for timingSafeEqual.
  const hash = (v: string) => crypto.createHash("sha256").update(v).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}

function createToken(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (session.exp < Date.now()) return null;
    if (session.role === "demo" && !demoEnabled()) return null;
    return session;
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string) {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function setSessionCookie(res: Response, session: Session) {
  res.cookie(COOKIE, createToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHosted,
    maxAge: SESSION_MS,
    path: "/",
  });
}

export function getSession(req: Request): Session | null {
  if (!authConfigured()) return null;
  return readToken(readCookie(req, COOKIE));
}

export const isDemoRequest = (req: Request) => getSession(req)?.role === "demo";

// ---------- login rate limit ----------

// Five wrong passwords from one address locks it out for 15 minutes. The counter
// lives in memory, so on serverless it is per instance. That is still enough to
// make guessing impractical for a single-user app.
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

function isLocked(ip: string) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > LOCK_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string) {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > LOCK_MS) failures.set(ip, { count: 1, first: Date.now() });
  else entry.count += 1;
  // Keep the map small.
  if (failures.size > 1000) failures.clear();
}

// ---------- middleware ----------

/** Stops cross-site form posts: a browser sends Origin on unsafe requests. */
export function sameOriginOnly(req: Request, res: Response, next: NextFunction) {
  const safe = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
  const origin = req.headers.origin;
  if (!safe && origin) {
    let host = "";
    try {
      host = new URL(origin).host;
    } catch {
      /* invalid origin is rejected below */
    }
    if (host !== req.headers.host) return res.status(403).json({ error: "Cross-site request blocked" });
  }
  next();
}

/** Every /api route except /api/auth/* needs a login. Demo users may only read. */
export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (authDisabled()) return next();
  if (!authConfigured()) {
    return res.status(503).json({ error: "Login is not set up. Add ADMIN_PASSWORD to the server environment." });
  }
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Please sign in" });
  if (session.role === "demo" && req.method !== "GET") {
    return res.status(403).json({ error: "The demo is read-only" });
  }
  next();
}

const loginSchema = z.object({
  username: z.string().max(200),
  password: z.string().max(500),
});

export function authRouter() {
  const router = express.Router();

  router.get("/me", (req, res) => {
    const base = { demoEnabled: demoEnabled(), authConfigured: authConfigured() || authDisabled() };
    if (authDisabled()) return res.json({ ...base, authenticated: true, role: "admin", username: "local" });
    const session = getSession(req);
    if (!session) return res.json({ ...base, authenticated: false });
    res.json({ ...base, authenticated: true, role: session.role, username: session.username });
  });

  router.post("/login", (req, res) => {
    if (!authConfigured()) {
      return res.status(503).json({ error: "Login is not set up. Add ADMIN_PASSWORD to the server environment." });
    }
    const ip = req.ip || "unknown";
    if (isLocked(ip)) {
      return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
    }
    const { username, password } = loginSchema.parse(req.body);
    // Both checks always run so the response time does not reveal which one failed.
    const userOk = safeEqual(username, adminUsername());
    const passOk = safeEqual(password, adminPassword());
    if (!(userOk && passOk)) {
      recordFailure(ip);
      return res.status(401).json({ error: "Wrong username or password" });
    }
    failures.delete(ip);
    const session: Session = { role: "admin", username: adminUsername(), exp: Date.now() + SESSION_MS };
    setSessionCookie(res, session);
    res.json({ authenticated: true, role: session.role, username: session.username });
  });

  router.post("/demo", (_req, res) => {
    if (!demoEnabled() || !authConfigured()) return res.status(404).json({ error: "Demo is not enabled" });
    const session: Session = { role: "demo", username: "demo", exp: Date.now() + 60 * 60 * 1000 };
    setSessionCookie(res, session);
    res.json({ authenticated: true, role: session.role, username: session.username });
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie(COOKIE, { path: "/" });
    res.json({ authenticated: false });
  });

  return router;
}

export function warnIfAuthOff() {
  if (authDisabled()) {
    console.warn("ADMIN_PASSWORD is not set: login is OFF in development. Set it in .env to turn login on.");
  }
}
