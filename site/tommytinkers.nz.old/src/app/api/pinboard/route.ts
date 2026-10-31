import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const STORAGE_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(STORAGE_DIR, "pinboard-feed.json");

async function readPosts() {
  try {
    const raw = await readFile(STORAGE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.posts) ? parsed.posts : [];
  } catch {
    return [];
  }
}

async function writePosts(posts: unknown[]) {
  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(STORAGE_FILE, JSON.stringify({ posts }, null, 2), "utf8");
}

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json({ posts });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const posts = Array.isArray(body?.posts) ? body.posts : [];
  await writePosts(posts);
  return NextResponse.json({ ok: true, posts });
}