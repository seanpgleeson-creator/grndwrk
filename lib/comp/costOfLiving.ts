/**
 * Static cost-of-living index table.
 * Index is relative — San Francisco = 100. Values are approximate and based on
 * major city CoL data (2024–2025). Easy to update or swap for an API later.
 *
 * Formula: equivalent_comp = amount * (target_city_index / base_city_index)
 */

const COL_INDEX: Record<string, number> = {
  // United States
  "San Francisco, CA": 100,
  "San Francisco": 100,
  "San Jose, CA": 96,
  "San Jose": 96,
  "New York, NY": 98,
  "New York": 98,
  "NYC": 98,
  "Seattle, WA": 87,
  "Seattle": 87,
  "Los Angeles, CA": 90,
  "Los Angeles": 90,
  "Boston, MA": 88,
  "Boston": 88,
  "Washington, DC": 86,
  "Washington DC": 86,
  "Washington, D.C.": 86,
  "Chicago, IL": 76,
  "Chicago": 76,
  "Austin, TX": 74,
  "Austin": 74,
  "Denver, CO": 77,
  "Denver": 77,
  "Miami, FL": 79,
  "Miami": 79,
  "Atlanta, GA": 68,
  "Atlanta": 68,
  "Dallas, TX": 70,
  "Dallas": 70,
  "Phoenix, AZ": 68,
  "Phoenix": 68,
  "Portland, OR": 79,
  "Portland": 79,
  "Minneapolis, MN": 71,
  "Minneapolis": 71,
  "Nashville, TN": 69,
  "Nashville": 69,
  "Charlotte, NC": 66,
  "Charlotte": 66,
  "Raleigh, NC": 67,
  "Raleigh": 67,
  "Pittsburgh, PA": 62,
  "Pittsburgh": 62,
  "Detroit, MI": 62,
  "Detroit": 62,
  "Salt Lake City, UT": 73,
  "Salt Lake City": 73,
  "Remote": 70,
  // International
  "London": 92,
  "London, UK": 92,
  "Toronto": 76,
  "Toronto, Canada": 76,
  "Vancouver": 79,
  "Vancouver, Canada": 79,
  "Sydney": 82,
  "Sydney, Australia": 82,
  "Singapore": 88,
  "Amsterdam": 83,
  "Berlin": 72,
  "Dublin": 80,
  "Dublin, Ireland": 80,
};

const DEFAULT_INDEX = 75; // fallback for unknown cities

/**
 * Returns true if the city has an entry in the static index table.
 * Used by the equivalence route to decide whether to call the external API.
 */
export function hasStaticCity(city: string): boolean {
  const key = city.trim();
  if (COL_INDEX[key] !== undefined) return true;
  const lower = key.toLowerCase();
  if (Object.keys(COL_INDEX).some((k) => k.toLowerCase() === lower)) return true;
  return Object.keys(COL_INDEX).some(
    (k) => lower.startsWith(k.toLowerCase()) || k.toLowerCase().startsWith(lower),
  );
}

/**
 * Returns the CoL index for a city (case-insensitive fuzzy match).
 * Falls back to DEFAULT_INDEX if city is unknown.
 */
export function getColIndex(city: string): number {
  const key = city.trim();
  // Exact match first
  if (COL_INDEX[key] !== undefined) return COL_INDEX[key];
  // Case-insensitive match
  const lower = key.toLowerCase();
  const found = Object.entries(COL_INDEX).find(([k]) => k.toLowerCase() === lower);
  if (found) return found[1];
  // Partial match — city name appears in key (e.g. "San Francisco, CA 94105")
  const partial = Object.entries(COL_INDEX).find(([k]) =>
    lower.startsWith(k.toLowerCase()) || k.toLowerCase().startsWith(lower),
  );
  if (partial) return partial[1];
  return DEFAULT_INDEX;
}

/**
 * Converts a compensation amount from one city to another using CoL indices.
 * Returns the equivalent amount needed in `toCity` to match the purchasing power
 * of `amount` in `fromCity`.
 */
export function convertComp(amount: number, fromCity: string, toCity: string): number {
  const fromIdx = getColIndex(fromCity);
  const toIdx = getColIndex(toCity);
  return Math.round((amount * toIdx) / fromIdx);
}

/** Format a number as currency, e.g. 185000 → "$185k" */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}
