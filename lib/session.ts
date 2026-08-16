import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "smartcat_editor";
const DAY = 86_400;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return value;
}

export function createSession() {
  const expires = Math.floor(Date.now() / 1000) + DAY;
  const payload = String(expires);
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function validSession(value?: string) {
  if (!value) return false;
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied || Number(payload) < Date.now() / 1000) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const actual = Buffer.from(supplied, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validPassword(value: string) {
  const expected = process.env.EDITOR_PASSWORD;
  if (!expected) throw new Error("EDITOR_PASSWORD is not configured");
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
