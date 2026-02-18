// MOCK: Import mock client for testing without backend
import { mockClient as client } from '@/client/mockClient.ts';
// REAL: Uncomment below line when backend is ready
// import { client } from '@/client/client.ts';

import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { adaptApiResponse, serviceFailureResponse } from '@/helpers/utilities/serviceHelpers.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import { ProjectsListResponseDTO, ProjectsListDataDTO } from './types/ProjectsListResponseDTO.ts';

/**
 * Get list of all projects with optional sorting
 * SEQ: 1.23 - Define async function getProjects(sortBy, sortOrder)
 */
export async function getProjects(
  sortBy: string = 'project_name',
  sortOrder: string = 'asc'
): Promise<ServiceResult<ProjectsListDataDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.PROJECTS}?sort_by=${sortBy}&sort_order=${sortOrder}`;

    // SEQ: 1.27 - Call client with fullEndpoint, null body, HTTP_METHOD.GET
    const response = await client(endpoint, null, HTTP_METHOD.GET);

    // SEQ: 1.36 - Call convertKeysToCamelCase with response.data
    const camelCaseData = convertKeysToCamelCase<ProjectsListResponseDTO>(response.data);

    return adaptApiResponse<ProjectsListDataDTO>({ ...response, data: camelCaseData });
  } catch (error) {
    Logger.error('Failed to fetch projects', {
      sortBy,
      sortOrder,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<ProjectsListDataDTO>(
      null,
      'Failed to fetch projects. Please try again.'
    );
  }
}


