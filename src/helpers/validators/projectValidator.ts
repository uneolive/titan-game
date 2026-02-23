/**
 * Validate project name
 * @param name - Project name string
 * @returns true if valid, false otherwise
 */
export function isValidProjectName(name: string): boolean {
  return name.trim().length >= 3;
}

/**
 * Validate project type
 * @param type - Project type string
 * @returns true if valid, false otherwise
 */
export function isValidProjectType(type: string): boolean {
  const validTypes = ['Architecture', 'Construction', 'Engineering'];
  return validTypes.includes(type);
}
