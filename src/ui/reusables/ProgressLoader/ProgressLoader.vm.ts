import { FiCheck, FiLoader, FiX } from 'react-icons/fi';

export function useProgressLoader() {
  const formatProgressPercentage = (progressPct: number): string => {
    return `${Math.round(progressPct)}%`;
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return FiCheck;
      case 'IN_PROGRESS':
        return FiLoader;
      case 'FAILED':
        return FiX;
      default:
        return FiLoader;
    }
  };

  const getStepStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'text-success';
      case 'IN_PROGRESS':
        return 'text-primary';
      case 'FAILED':
        return 'text-error';
      default:
        return 'text-gray-400';
    }
  };

  return {
    formatProgressPercentage,
    getStepStatusIcon,
    getStepStatusColor,
  };
}
