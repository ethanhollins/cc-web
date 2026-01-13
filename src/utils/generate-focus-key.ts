/**
 * Generate a focus/project key from a title following Notion formula logic.
 *
 * Logic:
 * 1. If override is provided, use it (uppercased, max 4 chars)
 * 2. Otherwise, split title by spaces and filter for words containing only letters
 * 3. If 1 valid word: take first 4 characters
 * 4. If 2 valid words: take first character of each word
 * 5. If 3+ valid words: take first character of first 3 words
 * 6. Uppercase the result and enforce 4 character maximum
 *
 * @param title - Focus/project title
 * @param override - Optional override key (max 4 characters)
 * @returns Generated key (uppercased, max 4 characters)
 *
 * @example
 * generateFocusKey("Command Centre") // "CC"
 * generateFocusKey("Python") // "PYTH"
 * generateFocusKey("AI Model Service") // "AMS"
 * generateFocusKey("Test", "CUSTOM") // "CUST"
 */
export function generateFocusKey(title: string, override?: string): string {
  if (override) {
    // Keep only alphabetical characters, uppercase, max 4 chars
    const cleanOverride = override.replace(/[^A-Za-z]/g, "");
    return cleanOverride.toUpperCase().slice(0, 4) || "PRJ";
  }

  // Split by spaces and filter for words containing only letters
  const validNames = title.split(" ").filter((word) => /^[A-Za-z]+$/.test(word));

  if (validNames.length === 0) {
    // Fallback: use first 4 chars of title if no valid words
    return title.slice(0, 4).toUpperCase() || "PRJ";
  }

  if (validNames.length === 1) {
    // Single word: take first 4 characters
    return validNames[0].slice(0, 4).toUpperCase();
  } else if (validNames.length === 2) {
    // Two words: take first char of each
    return (validNames[0][0] + validNames[1][0]).toUpperCase().slice(0, 4);
  } else {
    // Three or more words: take first char of first 3 words
    return (validNames[0][0] + validNames[1][0] + validNames[2][0]).toUpperCase().slice(0, 4);
  }
}
