import { NextRequest, NextResponse } from "next/server";
import { ensureSchema } from "@/lib/notion";
import { isEditor, sameOrigin, serverError, unauthorized } from "@/lib/http";
export async function POST(request: NextRequest) { try { if (!isEditor(request)) return unauthorized(); if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 }); return NextResponse.json({ ok: true, dataSourceId: await ensureSchema() }); } catch (error) { return serverError(error); } }
