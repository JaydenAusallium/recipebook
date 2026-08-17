import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImageToDrive } from "@/lib/googleDrive";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPEG, PNG, WebP, or GIF image." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 8MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${session.user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  try {
    const uploaded = await uploadImageToDrive(buffer, safeName, file.type);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (err) {
    console.error("Google Drive upload failed", err);
    const message =
      err instanceof Error ? err.message : "Image upload failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
