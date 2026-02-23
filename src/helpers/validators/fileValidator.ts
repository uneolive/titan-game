import Logger from '@/helpers/utilities/Logger.ts';

/**
 * Validates if file is a PDF
 * @param file - File to validate
 * @returns true if valid PDF, false otherwise
 */
export function isValidPDF(file: File): boolean {
  try {
    return file.type === 'application/pdf';
  } catch (error) {
    Logger.warn('PDF validation failed', {
      fileName: file?.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
