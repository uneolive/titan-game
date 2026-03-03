import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Logger from '@/helpers/utilities/Logger.ts';

// Type definitions
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestBody = Record<string, any> | FormData | null;

/**
 * Generic HTTP client for API requests
 * @param endpoint - Full API endpoint URL
 * @param body - Request body (for POST, PUT, PATCH)
 * @param method - HTTP method
 * @returns Promise<AxiosResponse>
 */
export async function client(
  endpoint: string,
  body: RequestBody = null,
  method: HttpMethod = 'GET'
): Promise<AxiosResponse> {
  const headers: Record<string, string> = {};

  // Only set Content-Type for JSON requests (not FormData)
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    headers,
    timeout: 300000, // 5 minutes
    ...(body && { data: body }),
  };

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      Logger.error('API request failed', {
        endpoint,
        method,
        status: axiosError.response?.status,
        message: axiosError.message,
      });

      throw axiosError;
    }
    throw error;
  }
}

/**
 * SSE client for Server-Sent Events streaming
 * @param endpoint - Full API endpoint URL
 * @param body - FormData for file uploads
 * @param signal - Optional AbortSignal for cancellation support
 * @returns Promise<Response>
 */
export async function fetchSSE(
  endpoint: string,
  body: FormData,
  signal?: AbortSignal
): Promise<Response> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unable to read error body');

      Logger.error('SSE request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });

      throw new Error(
        `SSE request failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return response;
  } catch (error) {
    Logger.error('SSE connection error', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
