// MOCK: Import mock client for testing without backend
import { mockClient as client, mockFetchSSE as fetchSSE } from '@/client/mockClient.ts';
// REAL: Uncomment below line when backend is ready
// import { client, fetchSSE } from '@/client/client.ts';

import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { adaptApiResponse, serviceFailureResponse } from '@/helpers/utilities/serviceHelpers.ts';
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

      if (camelCaseData.code === 200) {
      return adaptApiResponse<SpecSectionsDataDTO>({ ...response, data: camelCaseData });
    } else if (camelCaseData.code === 404) {
      return serviceFailureResponse<SpecSectionsDataDTO>(null, 'Project not found');
    } else {
      return serviceFailureResponse<SpecSectionsDataDTO>(null, camelCaseData.message);
    }
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
 */
export async function uploadSubmittal(formData: FormData): Promise<Response> {
  try {
      const endpoint = `${BASE_URL}${ENDPOINTS.SUBMITTAL_ASSISTANT}`;
      return await fetchSSE(endpoint, formData);
  } catch (error) {
      Logger.error('Service exception in uploadSubmittal', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
      throw error;
  }
}


