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
 * Maps response code to ServiceResult with custom error messages
 * Handles common status code patterns across services
 */
export function mapResponseCodeToServiceResult<T>(
  code: number,
  data: any,
  message: string,
  response: AxiosResponse<any>
): ServiceResult<T> {
  switch (code) {
    case 200:
      return adaptApiResponse<T>({ ...response, data: { code, data, message } });
    case 404:
      return {
        data: null,
        message: message || 'Resource not found',
        statusCode: ServiceResultStatusENUM.ERROR,
      };
    case 400:
    case 422:
      return {
        data: null,
        message: message || 'Validation error',
        statusCode: ServiceResultStatusENUM.VALIDATION_ERROR,
      };
    case 500:
      return {
        data: null,
        message: message || 'Server error',
        statusCode: ServiceResultStatusENUM.SERVER_ERROR,
      };
    default:
      return {
        data: null,
        message: message || 'An error occurred',
        statusCode: ServiceResultStatusENUM.ERROR,
      };
  }
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
