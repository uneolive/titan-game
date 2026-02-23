import Logger from '@/helpers/utilities/Logger.ts';

/**
 * Validates password (minimum 6 characters)
 * @param password - Password to validate
 * @returns true if valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  try {
    if (!password || password.length < 6) return false;
    return true;
  } catch (error) {
    Logger.warn('Password validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
