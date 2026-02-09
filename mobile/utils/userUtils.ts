/**
 * Extract initials from a full name
 * Examples:
 * - "John Doe" -> "JD"
 * - "John" -> "J"
 * - "John Michael Doe" -> "JD"
 * - "john doe" -> "JD"
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name || !name.trim()) {
    return 'U';
  }

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return 'U';
  }

  if (words.length === 1) {
    // Single word - return first letter
    return words[0].charAt(0).toUpperCase();
  }

  // Multiple words - return first letter of first word + first letter of last word
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
};

