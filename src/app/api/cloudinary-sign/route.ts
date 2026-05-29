import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { public_ids } = await req.json();

  if (!Array.isArray(public_ids) || public_ids.length === 0) {
    return NextResponse.json(
      { error: "public_ids es requerido" },
      { status: 400 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { public_ids: public_ids.join(","), timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({ signature, timestamp });
}