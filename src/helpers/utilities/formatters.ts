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
