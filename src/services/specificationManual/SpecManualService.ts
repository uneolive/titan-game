import { client } from '@/client/client.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import {
  serviceFailureResponse,
  mapResponseCodeToServiceResult,
} from '@/helpers/utilities/serviceHelpers.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import { ProjectSetupResponseDTO, ProjectSetupDataDTO } from './types/ProjectSetupResponseDTO.ts';
import { SpecUploadResponseDTO, SpecUploadDataDTO } from './types/SpecUploadResponseDTO.ts';

/**
 * Get project setup data for prepopulation
 */
export async function getProjectSetup(
  projectId: string
): Promise<ServiceResult<ProjectSetupDataDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.PROJECT_SETUP.replace(':projectId', projectId)}`;
    const response = await client(endpoint, null, HTTP_METHOD.GET);

    const camelCaseData = convertKeysToCamelCase<ProjectSetupResponseDTO>(response.data);

    return mapResponseCodeToServiceResult<ProjectSetupDataDTO>(
      camelCaseData.code,
      camelCaseData.data,
      camelCaseData.message,
      response
    );
  } catch (error) {
    Logger.error('Service exception in getProjectSetup', {
      projectId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<ProjectSetupDataDTO>(null, 'Failed to load project setup');
  }
}

/**
 * Upload specification manual
 */
export async function uploadSpecManual(
  formData: FormData
): Promise<ServiceResult<SpecUploadDataDTO>> {
  try {
    const endpoint = `${BASE_URL}${ENDPOINTS.SPEC_UPLOAD}`;
    const response = await client(endpoint, formData, HTTP_METHOD.POST);

    const camelCaseData = convertKeysToCamelCase<SpecUploadResponseDTO>(response.data);

    return mapResponseCodeToServiceResult<SpecUploadDataDTO>(
      camelCaseData.code,
      camelCaseData.data,
      camelCaseData.message,
      response
    );
  } catch (error) {
    Logger.error('Service exception in uploadSpecManual', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<SpecUploadDataDTO>(null, 'Failed to upload specification manual');
  }
}
