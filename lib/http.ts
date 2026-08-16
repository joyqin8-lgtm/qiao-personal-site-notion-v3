import { NextRequest, NextResponse } from "next/server";
import { validSession, COOKIE_NAME } from "./session";

export function isEditor(request: NextRequest) {
  return validSession(request.cookies.get(COOKIE_NAME)?.value);
}
export function unauthorized() { return NextResponse.json({ error: "请先登录编辑模式" }, { status: 401 }); }
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}
export function serverError(error: unknown) {
  console.error(error);
  const message = error instanceof Error ? error.message : "服务器错误";
  return NextResponse.json({ error: message }, { status: 500 });
}
