// Utilities for generating sequential IDs per year, e.g. 2025-0001

/**
 * Generate the next ID in the format YYYY-0001 based on existing IDs.
 * The counter resets each calendar year.
 */
export function generateYearlyId(existingIds: string[], now: Date = new Date()): string {
  const year = now.getFullYear();
  const prefix = `${year}-`;

  // Find the highest sequence for the current year among existing IDs
  let maxSeq = 0;
  for (const id of existingIds) {
    if (id.startsWith(prefix)) {
      const [, seqPart] = id.split('-');
      const n = parseInt(seqPart, 10);
      if (!Number.isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }

  const nextSeq = maxSeq + 1;
  const suffix = String(nextSeq).padStart(4, '0');
  return `${prefix}${suffix}`;
}

/**
 * Validate if an ID already matches the YYYY-0001 format
 */
export function isYearlyId(id: string): boolean {
  return /^\d{4}-\d{4}$/.test(id);
}

/**
 * Generate a simple random ID for general use
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
