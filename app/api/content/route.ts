import { NextRequest, NextResponse } from "next/server";
import { createItem, listItems } from "@/lib/notion";
import { isEditor, sameOrigin, serverError, unauthorized } from "@/lib/http";
export async function GET(request: NextRequest) { try { const editor = isEditor(request); return NextResponse.json({ items: await listItems(editor), editor }); } catch (error) { return serverError(error); } }
export async function POST(request: NextRequest) { try { if (!isEditor(request)) return unauthorized(); if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 }); return NextResponse.json(await createItem(await request.json()), { status: 201 }); } catch (error) { return serverError(error); } }
