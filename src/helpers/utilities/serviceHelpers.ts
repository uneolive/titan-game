import { AxiosResponse } from 'axios';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';

/**
 * Adapts API response to ServiceResult format
 * Maps HTTP status codes to ServiceResultStatusENUM
 */
export function adaptApiResponse<T>(response: AxiosResponse<any>): ServiceResult<T> {
  const { data } = response;
  const code = data.code || response.status;

  let statusCode: ServiceResultStatusENUM;

  switch (code) {
    case 200:
      statusCode = ServiceResultStatusENUM.SUCCESS;
      break;
    case 401:
      statusCode = ServiceResultStatusENUM.UNAUTHORIZED;
      break;
    case 400:
    case 422:
      statusCode = ServiceResultStatusENUM.VALIDATION_ERROR;
      break;
    case 500:
      statusCode = ServiceResultStatusENUM.SERVER_ERROR;
      break;
    default:
      statusCode = ServiceResultStatusENUM.ERROR;
  }

  return {
    data: data.data || null,
    message: data.message || 'Request completed',
    statusCode,
  };
}

/**
 * Creates a failure ServiceResult
 * Used for error handling in services
 */
export function serviceFailureResponse<T>(
  data: T | null = null,
  message: string = 'An error occurred. Please try again.'
): ServiceResult<T> {
  return {
    data,
    message,
    statusCode: ServiceResultStatusENUM.ERROR,
  };
}
