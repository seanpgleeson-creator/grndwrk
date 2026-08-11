/**
 * APIVerve Cost of Living API client.
 * Docs: https://apiverve.com/marketplace/costliving
 *
 * Returns per-(from,to) equivalence ratios. Callers should layer the static
 * table on top and use this only for cities not in the static index.
 */

export interface EquivalenceResult {
  ratio: number;
  regionFrom?: string;
  regionTo?: string;
  source: "apiverve";
}

interface ApiVerveResponse {
  status: string;
  error?: string | null;
  data?: {
    from?: { costIndex?: number; regionName?: string };
    to?: { costIndex?: number; regionName?: string };
    comparison?: {
      salaryEquivalent?: {
        fromSalary?: number;
        equivalentSalary?: number;
      };
    };
  };
}

const BASE = "https://api.apiverve.com/v1/costliving";
const BASELINE_SALARY = 100_000;

/**
 * Fetches the equivalence ratio for salary conversion from `from` to `to`.
 * Returns null when the API key is missing, the request fails, or the API
 * does not return a valid salary equivalence (so callers fall back gracefully).
 */
export async function fetchEquivalenceRatio(
  from: string,
  to: string,
): Promise<EquivalenceResult | null> {
  const key = process.env.APIVERVE_API_KEY;
  if (!key) return null;

  try {
    const url = new URL(BASE);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("fromSalary", String(BASELINE_SALARY));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "x-api-key": key },
      // Allow Next.js to cache the response at the fetch layer
      next: { revalidate: 60 * 60 * 24 * 7 }, // 1 week
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ApiVerveResponse;
    if (json.status !== "ok" || !json.data) return null;

    const equiv = json.data.comparison?.salaryEquivalent;
    if (!equiv?.fromSalary || !equiv?.equivalentSalary) return null;

    const ratio = equiv.equivalentSalary / equiv.fromSalary;

    return {
      ratio,
      regionFrom: json.data.from?.regionName,
      regionTo: json.data.to?.regionName,
      source: "apiverve",
    };
  } catch {
    return null;
  }
}
