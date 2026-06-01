import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "missing_file", message: "No file provided" },
        { status: 400 },
      );
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (name.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import("pdf-parse") as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "unsupported_format", message: "Please upload a PDF, DOCX, or TXT file" },
        { status: 400 },
      );
    }

    // Clamp to a reasonable size (~50k chars)
    const trimmed = text.trim().slice(0, 50000);

    await prisma.userProfile.upsert({
      where: { id: "singleton" },
      update: { resume_raw: trimmed },
      create: {
        id: "singleton",
        narrative_pillars: "[]",
        target_roles: "[]",
        target_stages: "[]",
        resume_raw: trimmed,
      },
    });

    revalidatePath("/profile");
    return NextResponse.json({ data: { resume_raw: trimmed } });
  } catch (err) {
    console.error("resume upload error:", err);
    return NextResponse.json(
      { error: "parse_error", message: "Failed to parse file" },
      { status: 500 },
    );
  }
}
