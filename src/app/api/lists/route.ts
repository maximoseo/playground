import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readSavedLists, writeSavedLists } from "@/lib/storage";

export async function GET() {
  const lists = await readSavedLists();
  return NextResponse.json(lists);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const lists = await readSavedLists();
  const list = {
    id: payload.id ?? randomUUID(),
    name: payload.name ?? "Untitled list",
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    keywords: payload.keywords ?? [],
  };

  const next = [...lists.filter((item) => item.id !== list.id), list];
  await writeSavedLists(next);
  return NextResponse.json(list);
}
