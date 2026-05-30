import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { buildJdExtractPrompt, JdExtractSchema } from "@/lib/ai/prompts/jdExtract";

export const maxDuration = 60;

function stripHtml(html: string): string {
  // Remove script and style blocks entirely
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  // Replace block-level tags with newlines for readability
  text = text.replace(/<\/(p|div|li|h[1-6]|section|article|header|footer|nav|main)>/gi, "\n");

  // Strip all remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Collapse whitespace and trim
  text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured", message: "AI is not configured on this server" },
      { status: 503 },
    );
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "bad_request", message: "url is required" },
      { status: 400 },
    );
  }

  // Basic URL validation
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid URL" },
      { status: 400 },
    );
  }

  // Fetch the job posting page
  let html: string;
  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; grndwrk-jd-fetcher/1.0; +https://grndwrk.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "fetch_failed",
          message: `Could not fetch the URL (status ${res.status}). Try pasting the description manually.`,
          retryable: false,
        },
        { status: 502 },
      );
    }

    html = await res.text();
  } catch (err) {
    console.error("JD fetch error:", err);
    return NextResponse.json(
      {
        error: "fetch_failed",
        message: "Could not reach the URL. Try pasting the description manually.",
        retryable: false,
      },
      { status: 502 },
    );
  }

  // Strip HTML and clamp to ~50k chars to stay within context limits
  const pageText = stripHtml(html).slice(0, 50_000);

  try {
    const raw = await callClaude({
      system:
        "You are a precise data extractor. Extract job description information from web page text and return only valid JSON matching the specified schema. Never invent information not present in the text.",
      user: buildJdExtractPrompt(pageText),
      maxTokens: 4096,
    });

    const result = parseWithSchema(raw, JdExtractSchema);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("JD extract AI error:", err);
    return NextResponse.json(
      {
        error: "ai_error",
        message: "AI extraction failed. Try pasting the description manually.",
        retryable: true,
      },
      { status: 502 },
    );
  }
}
