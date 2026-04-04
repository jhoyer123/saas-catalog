import { purgeCatalogCache } from "@/lib/cloudflare/purgeCache";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://funny-concha-3914f2.netlify.app",
];

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowed ? origin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-revalidate-secret",
    },
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-revalidate-secret",
  };

  const secret = req.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  const { path, tag, storeSlug } = await req.json();

  if (!path) {
    return Response.json(
      { success: false, error: "Path is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  if (!tag) {
    return Response.json(
      { success: false, error: "Tag is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  revalidateTag(tag, "max");
  revalidatePath(path);
  await purgeCatalogCache(storeSlug);

  return Response.json(
    { success: true, revalidated: path },
    { status: 200, headers: corsHeaders },
  );
}
