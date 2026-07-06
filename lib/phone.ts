/**
 * Formats an E.164 US/Canada number (e.g. "+12296006648") as
 * "1 (229) 600-6648" for display. Falls back to the raw input for any
 * other shape rather than guessing at international formatting.
 */
export function formatPhoneDisplay(e164: string): string {
  const match = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (!match) return e164;
  const [, areaCode, prefix, line] = match;
  return `1 (${areaCode}) ${prefix}-${line}`;
}
