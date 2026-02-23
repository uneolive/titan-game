import Logger from '@/helpers/utilities/Logger.ts';

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  try {
    if (!email || email.length < 5) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    Logger.warn('Email validation failed', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
