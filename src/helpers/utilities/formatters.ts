/**
 * Format confidence score from decimal to percentage
 * @param score - Decimal value (e.g., 0.95)
 * @returns Formatted percentage string (e.g., "95%")
 */
export function formatConfidenceScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get status color class for styling
 * @param status - Status string
 * @returns Tailwind color class
 */
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
      return 'text-success';
    case 'NON_COMPLIANT':
      return 'text-error';
    case 'NOT_FOUND':
      return 'text-gray-500';
    case 'UNCLEAR':
      return 'text-warning';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get status background color class for badges
 * @param status - Status string
 * @returns Tailwind background color class
 */
export function getStatusBgColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
      return 'bg-green-100 text-green-800';
    case 'NON_COMPLIANT':
      return 'bg-red-100 text-red-800';
    case 'NOT_FOUND':
      return 'bg-gray-100 text-gray-800';
    case 'UNCLEAR':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING':
      return 'bg-gray-100 text-gray-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PARTIALLY_COMPLIANT':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status icon component name
 * @param status - Status string
 * @returns Icon name for react-icons
 */
export function getStatusIcon(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLIANT':
    case 'COMPLETED':
      return 'FiCheck';
    case 'NON_COMPLIANT':
    case 'FAILED':
      return 'FiX';
    case 'NOT_FOUND':
      return 'FiHelpCircle';
    case 'UNCLEAR':
      return 'FiAlertTriangle';
    case 'IN_PROGRESS':
      return 'FiLoader';
    case 'PENDING':
      return 'FiClock';
    default:
      return 'FiCircle';
  }
}

/**
 * Convert UTC date string to local date and time
 * @param utcDateString - UTC date string (e.g., "2026-03-03T13:23:09.624507")
 * @returns Formatted local date and time string (e.g., "Mar 3, 2026, 6:53 PM")
 */
export function formatDateToLocal(utcDateString: string): string {
  try {
    const date = new Date(utcDateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return utcDateString; // Return original if invalid
    }

    // Format: "Mar 3, 2026, 6:53 PM"
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return utcDateString; // Return original on error
  }
}

/**
 * Convert UTC date string to local date only (no time)
 * @param utcDateString - UTC date string (e.g., "2026-03-03T13:23:09.624507")
 * @returns Formatted local date string (e.g., "Mar 3, 2026")
 */
export function formatDateOnly(utcDateString: string): string {
  try {
    const date = new Date(utcDateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return utcDateString; // Return original if invalid
    }

    // Format: "Mar 3, 2026"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return utcDateString; // Return original on error
  }
}
