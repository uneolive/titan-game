import { client } from '@/client/client.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { adaptApiResponse, serviceFailureResponse } from '@/helpers/utilities/serviceHelpers.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import { ProjectDetailsResponseDTO } from './types/ProjectDetailsResponseDTO.ts';

/**
 * Get project details including spec documents and submittals
 */
export async function getProjectDetails(
  projectId: string
): Promise<ServiceResult<ProjectDetailsResponseDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.PROJECT_DETAILS.replace(':projectId', projectId)}`;
    const response = await client(endpoint, null, HTTP_METHOD.GET);

    // Convert the entire response to camelCase
    const camelCaseData = convertKeysToCamelCase(response.data);

    // adaptApiResponse will extract data.data and map status codes
    return adaptApiResponse<ProjectDetailsResponseDTO>({ ...response, data: camelCaseData });
  } catch (error) {
    Logger.error('Service exception in getProjectDetails', {
      projectId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<ProjectDetailsResponseDTO>(
      null,
      'Failed to load project details'
    );
  }
}
