/**
 * Validate submittal title
 * @param title - Title string
 * @returns true if valid, false otherwise
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length >= 3;
}

/**
 * Validate specification section
 * @param specSection - Spec section string
 * @returns true if valid, false otherwise
 */
export function isValidSpecSection(specSection: string): boolean {
  return specSection.trim().length > 0;
}
