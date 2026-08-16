import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createSession, validPassword } from "@/lib/session";
import { sameOrigin, serverError } from "@/lib/http";

export async function POST(request: NextRequest) { try { if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 }); const { password } = await request.json(); if (!validPassword(String(password ?? ""))) return NextResponse.json({ error: "密码错误" }, { status: 401 }); const response = NextResponse.json({ ok: true }); response.cookies.set(COOKIE_NAME, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 86400 }); return response; } catch (error) { return serverError(error); } }
export async function DELETE(request: NextRequest) { const response = NextResponse.json({ ok: true }); response.cookies.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" }); return response; }
