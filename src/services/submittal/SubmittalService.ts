// MOCK: Import mock client for testing without backend
import { mockClient as client, mockFetchSSE as fetchSSE } from '@/client/mockClient.ts';
// REAL: Uncomment below line when backend is ready
// import { client, fetchSSE } from '@/client/client.ts';

import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import {
  serviceFailureResponse,
  mapResponseCodeToServiceResult,
} from '@/helpers/utilities/serviceHelpers.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { SpecSectionsResponseDTO, SpecSectionsDataDTO } from './types/SpecSectionsResponseDTO.ts';

/**
 * Get specification sections for a project
 */
export async function getSpecificationSections(
  projectId: string
): Promise<ServiceResult<SpecSectionsDataDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.PROJECT_SECTIONS.replace(':projectId', projectId)}`;
    const response = await client(endpoint, null, HTTP_METHOD.GET);

    const camelCaseData = convertKeysToCamelCase<SpecSectionsResponseDTO>(response.data);

    return mapResponseCodeToServiceResult<SpecSectionsDataDTO>(
      camelCaseData.code,
      camelCaseData.data,
      camelCaseData.message,
      response
    );
  } catch (error) {
    Logger.error('Service exception in getSpecificationSections', {
      projectId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<SpecSectionsDataDTO>(
      null,
      'Failed to load specification sections'
    );
  }
}

/**
 * Upload submittal and return SSE stream
 * @param formData - FormData containing submittal information and files
 * @param signal - Optional AbortSignal for cancellation support
 * @returns Promise<Response> - SSE stream response
 */
export async function uploadSubmittal(formData: FormData, signal?: AbortSignal): Promise<Response> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.SUBMITTAL_ASSISTANT}`;
    const response = await fetchSSE(endpoint, formData, signal);

    // Validate response before returning
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    Logger.error('Service exception in uploadSubmittal', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
