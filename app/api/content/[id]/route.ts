import { NextRequest, NextResponse } from "next/server";
import { updateItem } from "@/lib/notion";
import { isEditor, sameOrigin, serverError, unauthorized } from "@/lib/http";
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { if (!isEditor(request)) return unauthorized(); if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 }); const { id } = await context.params; return NextResponse.json(await updateItem(id, await request.json())); } catch (error) { return serverError(error); } }
