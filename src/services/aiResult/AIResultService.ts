// MOCK: Import mock client for testing without backend
import { mockClient as client, MockEventSource } from '@/client/mockClient.ts';
// REAL: Uncomment below line when backend is ready
// import { client } from '@/client/client.ts';

import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import {
  serviceFailureResponse,
  mapResponseCodeToServiceResult,
} from '@/helpers/utilities/serviceHelpers.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import {
  SubmittalResultResponseDTO,
  SubmittalResultDataDTO,
} from './types/SubmittalResultResponseDTO.ts';
import { SubmittalProgressBO } from '@/types/bos/progressLoader/SubmittalProgressBO.ts';
import { SubmittalCompleteBO } from '@/types/bos/progressLoader/SubmittalCompleteBO.ts';

/**
 * Get submittal analysis result
 */
export async function getSubmittalResult(
  submittalId: string
): Promise<ServiceResult<SubmittalResultDataDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.SUBMITTAL_RESULT.replace(':submittalId', submittalId)}`;
    const response = await client(endpoint, null, HTTP_METHOD.GET);

    const camelCaseData = convertKeysToCamelCase<SubmittalResultResponseDTO>(response.data);

    return mapResponseCodeToServiceResult<SubmittalResultDataDTO>(
      camelCaseData.code,
      camelCaseData.data,
      camelCaseData.message,
      response
    );
  } catch (error) {
    Logger.error('Service exception in getSubmittalResult', {
      submittalId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<SubmittalResultDataDTO>(null, 'Failed to load submittal result');
  }
}

/**
 * Subscribe to submittal progress via SSE
 */
export function subscribeToSubmittalProgress(
  submittalId: string,
  onProgress: (data: SubmittalProgressBO) => void,
  onComplete: (data: SubmittalCompleteBO) => void,
  onError: (error: string) => void
): EventSource {
  const endpoint = `${BASE_URL}${ENDPOINTS.SUBMITTAL_PROGRESS.replace(':submittalId', submittalId)}`;

  // MOCK: Use MockEventSource for testing
  const eventSource = new MockEventSource(endpoint) as unknown as EventSource;
  // REAL: Use real EventSource when backend is ready
  // const eventSource = new EventSource(endpoint);

  eventSource.addEventListener('progress', (event) => {
    try {
      const data = JSON.parse(event.data);
      const camelCaseData = convertKeysToCamelCase<SubmittalProgressBO>(data);
      onProgress(camelCaseData);
    } catch (error) {
      Logger.error('Error parsing progress event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        rawData: event.data,
      });

      // Close connection and notify error
      eventSource.close();
      onError('Failed to parse progress data');
    }
  });

  eventSource.addEventListener('complete', (event) => {
    try {
      const data = JSON.parse(event.data);
      const camelCaseData = convertKeysToCamelCase<SubmittalCompleteBO>(data);
      onComplete(camelCaseData);
      eventSource.close();
    } catch (error) {
      Logger.error('Error parsing complete event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        rawData: event.data,
      });

      // Close connection and notify error
      eventSource.close();
      onError('Failed to parse completion data');
    }
  });

  eventSource.addEventListener('error', (event: any) => {
    try {
      if (event.data) {
        const data = JSON.parse(event.data);
        const camelCaseData = convertKeysToCamelCase<any>(data);
        onError(camelCaseData.errorMessage || 'Analysis failed');
      } else {
        onError('Connection error occurred');
      }
      eventSource.close();
    } catch (error) {
      Logger.error('Error parsing error event', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      onError('An unexpected error occurred');
      eventSource.close();
    }
  });

  return eventSource;
}

/**
 * Unsubscribe from submittal progress
 */
export function unsubscribeFromSubmittalProgress(eventSource: EventSource): void {
  eventSource.close();
}
