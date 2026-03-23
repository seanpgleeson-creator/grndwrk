import type { ZodType } from "zod";

/**
 * Claude often wraps JSON in ```json ... ``` fences. Extract and parse.
 */
export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (fence) return fence[1].trim();
  const inline = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (inline >= 0 && last > inline) return trimmed.slice(inline, last + 1);
  return trimmed;
}

export function parseWithSchema<T>(raw: string, schema: ZodType<T>): T {
  const text = extractJsonText(raw);
  const parsed = JSON.parse(text) as unknown;
  return schema.parse(parsed);
}
